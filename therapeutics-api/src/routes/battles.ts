import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../middleware/errorHandler'

export const battlesRouter = Router({ mergeParams: true })

const battleSchema = z.object({
  outcome: z.enum(['VICTORY', 'DEFEAT']),
  bossLevel: z.number().int().positive().default(3),
  comboMax: z.number().int().min(0).default(0),
})

// POST /api/sessions/:id/battle
// [AC-04] Even on DEFEAT, if the session's walked distance already met the
// patient's daily goal, a discipline token is still issued — the clinical
// outcome always outranks the game outcome.
battlesRouter.post(
  '/battle',
  asyncHandler(async (req, res) => {
    const session = await prisma.walkSession.findUnique({ where: { id: req.params.id }, include: { patient: true } })
    if (!session) throw new ApiError(404, 'ไม่พบเซสชันการเดินนี้')

    const body = battleSchema.parse(req.body)

    const battleResult = await prisma.battleResult.upsert({
      where: { sessionId: session.id },
      update: body,
      create: { sessionId: session.id, ...body },
    })

    const clinicalGoalMet = session.distanceM >= session.patient.dailyDistanceGoalM
    let token = null
    if (clinicalGoalMet) {
      token = await prisma.rewardToken.create({ data: { patientId: session.patientId } })
    }

    res.status(200).json({ battleResult, clinicalGoalMet, token })
  })
)
