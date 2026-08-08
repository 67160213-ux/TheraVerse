import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { getConsentedPatientOrThrow } from '../utils/getConsentedPatient'

export const devicesRouter = Router({ mergeParams: true })

const pairSchema = z.object({
  deviceType: z.enum(['WATCH', 'CGM']),
  connected: z.boolean().default(true),
})

// POST /api/patients/:hn/devices/pair — [AC-02] records pairing state after
// the client completes a Web Bluetooth handshake. Idempotent per device type.
devicesRouter.post(
  '/pair',
  asyncHandler(async (req, res) => {
    const patient = await getConsentedPatientOrThrow(req.params.hn)
    const { deviceType, connected } = pairSchema.parse(req.body)

    const link = await prisma.deviceLink.upsert({
      where: { patientId_deviceType: { patientId: patient.id, deviceType } },
      update: { connected, lastSeenAt: new Date() },
      create: { patientId: patient.id, deviceType, connected, lastSeenAt: new Date() },
    })

    res.status(200).json(link)
  })
)

devicesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const patient = await getConsentedPatientOrThrow(req.params.hn)
    const devices = await prisma.deviceLink.findMany({ where: { patientId: patient.id } })
    res.json(devices)
  })
)
