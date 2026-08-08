import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../middleware/errorHandler'
import { getConsentedPatientOrThrow } from '../utils/getConsentedPatient'
import { computeZone } from '../utils/zone'

// Mounted at /api/patients/:hn/sessions — creation only, scoped to a patient's HN.
export const sessionsRouter = Router({ mergeParams: true })

// POST /api/patients/:hn/sessions — Start Walk Tracker (journey step 5).
sessionsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const patient = await getConsentedPatientOrThrow(req.params.hn)
    const devices = await prisma.deviceLink.findMany({ where: { patientId: patient.id } })
    const bothConnected =
      devices.find((d) => d.deviceType === 'WATCH')?.connected && devices.find((d) => d.deviceType === 'CGM')?.connected
    if (!bothConnected) throw new ApiError(409, 'ต้องเชื่อมต่อทั้งนาฬิกาและ CGM ก่อนเริ่มเดิน')

    const session = await prisma.walkSession.create({ data: { patientId: patient.id } })
    res.status(201).json(session)
  })
)

// Mounted at /api/sessions — progress/completion/detail, scoped by session id.
export const sessionDetailRouter = Router()

const progressSchema = z.object({
  heartRateBpm: z.number().int().min(20).max(240),
  glucoseMgDl: z.number().int().min(30).max(500),
  deltaDistanceM: z.number().min(0).default(0),
  gpsLost: z.boolean().default(false),
})

// POST /api/sessions/:id/progress — [AC-02/AC-03/edge case 2] ingests one
// vitals tick from the device stream, updates zone, accrues distance only
// while in the green zone, and increments safety-break/GPS-loss counters.
sessionDetailRouter.post(
  '/:id/progress',
  asyncHandler(async (req, res) => {
    const session = await prisma.walkSession.findUnique({ where: { id: req.params.id }, include: { patient: true } })
    if (!session) throw new ApiError(404, 'ไม่พบเซสชันการเดินนี้')
    if (session.status !== 'ACTIVE') throw new ApiError(409, 'เซสชันนี้สิ้นสุดไปแล้ว')

    const body = progressSchema.parse(req.body)
    const zone = computeZone(body.heartRateBpm, body.glucoseMgDl, session.patient.targetHrLow, session.patient.targetHrHigh)

    const reading = await prisma.vitalReading.create({
      data: {
        patientId: session.patientId,
        sessionId: session.id,
        heartRateBpm: body.heartRateBpm,
        glucoseMgDl: body.glucoseMgDl,
        zone,
      },
    })

    const updated = await prisma.walkSession.update({
      where: { id: session.id },
      data: {
        distanceM: { increment: zone === 'green' ? Math.round(body.deltaDistanceM) : 0 },
        gpsLostEvents: { increment: body.gpsLost ? 1 : 0 },
        safetyBreaks: { increment: zone === 'red' ? 1 : 0 },
      },
    })

    res.json({ session: updated, zone, reading })
  })
)

const completeSchema = z.object({
  status: z.enum(['COMPLETED', 'ABORTED_CRITICAL']).default('COMPLETED'),
})

sessionDetailRouter.post(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    const { status } = completeSchema.parse(req.body)
    const session = await prisma.walkSession.update({
      where: { id: req.params.id },
      data: { status, endedAt: new Date() },
    })
    res.json(session)
  })
)

sessionDetailRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const session = await prisma.walkSession.findUnique({
      where: { id: req.params.id },
      include: { battleResult: true, clinicalReport: true },
    })
    if (!session) throw new ApiError(404, 'ไม่พบเซสชันการเดินนี้')
    res.json(session)
  })
)
