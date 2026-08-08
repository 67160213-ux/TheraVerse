import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../middleware/errorHandler'

export const clinicalReportsRouter = Router({ mergeParams: true })

// POST /api/sessions/:id/clinical-report
// [Journey step 11] Aggregates the session's vitals into a report payload.
// In production, `payload` would be encrypted at rest (e.g. field-level
// encryption or an envelope key per hospital tenant) before being persisted;
// this scaffold stores the serialized profile directly for demo purposes.
clinicalReportsRouter.post(
  '/clinical-report',
  asyncHandler(async (req, res) => {
    const session = await prisma.walkSession.findUnique({
      where: { id: req.params.id },
      include: { vitals: true, battleResult: true, patient: true },
    })
    if (!session) throw new ApiError(404, 'ไม่พบเซสชันการเดินนี้')

    const payload = {
      hn: session.patient.hn,
      distanceM: session.distanceM,
      safetyBreaks: session.safetyBreaks,
      gpsLostEvents: session.gpsLostEvents,
      battleOutcome: session.battleResult?.outcome ?? null,
      heartRateSeries: session.vitals.map((v) => ({ t: v.recordedAt, bpm: v.heartRateBpm, zone: v.zone })),
      glucoseSeries: session.vitals.map((v) => ({ t: v.recordedAt, mgDl: v.glucoseMgDl })),
    }

    const report = await prisma.clinicalReport.upsert({
      where: { sessionId: session.id },
      update: { payload },
      create: { patientId: session.patientId, sessionId: session.id, payload },
    })

    res.status(201).json(report)
  })
)

export const patientReportsRouter = Router({ mergeParams: true })

patientReportsRouter.get(
  '/clinical-reports',
  asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findUnique({ where: { hn: req.params.hn } })
    if (!patient) throw new ApiError(404, 'ไม่พบผู้ป่วยรายนี้')
    const reports = await prisma.clinicalReport.findMany({
      where: { patientId: patient.id },
      orderBy: { submittedAt: 'desc' },
    })
    res.json(reports)
  })
)
