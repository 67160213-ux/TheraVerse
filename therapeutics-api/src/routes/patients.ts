import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../middleware/errorHandler'

export const patientsRouter = Router()

const registerSchema = z.object({
  hn: z.string().min(4).max(20),
  name: z.string().min(1).default('ผู้ป่วย'),
  age: z.number().int().positive().default(60),
  condition: z.string().default('เบาหวานชนิดที่ 2'),
  targetHrLow: z.number().int().positive().optional(),
  targetHrHigh: z.number().int().positive().optional(),
  dailyDistanceGoalM: z.number().int().positive().optional(),
})

// POST /api/patients — looks up an existing patient by HN, or registers a
// new one (mirrors the hospital-DB lookup on the Landing screen).
patientsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body)

    const patient = await prisma.patient.upsert({
      where: { hn: body.hn },
      update: {},
      create: body,
    })

    res.status(200).json(patient)
  })
)

patientsRouter.get(
  '/:hn',
  asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findUnique({ where: { hn: req.params.hn } })
    if (!patient) throw new ApiError(404, 'ไม่พบผู้ป่วยรายนี้')
    res.json(patient)
  })
)

const consentSchema = z.object({ agreed: z.literal(true) })

// PATCH /api/patients/:hn/consent — [AC-01] must be accepted before any
// device pairing or vitals ingestion is permitted for this patient.
patientsRouter.patch(
  '/:hn/consent',
  asyncHandler(async (req, res) => {
    const { agreed } = consentSchema.parse(req.body)
    const patient = await prisma.patient.update({
      where: { hn: req.params.hn },
      data: { consentGiven: agreed, consentAt: new Date() },
    })
    res.json(patient)
  })
)
