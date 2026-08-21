import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../middleware/errorHandler'
import { randomPromoCode } from '../utils/zone'

export const rewardsRouter = Router({ mergeParams: true })

rewardsRouter.get(
  '/rewards',
  asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findUnique({ where: { hn: req.params.hn } })
    if (!patient) throw new ApiError(404, 'ไม่พบผู้ป่วยรายนี้')

    const [tokens, vouchers] = await Promise.all([
      prisma.rewardToken.findMany({ where: { patientId: patient.id }, orderBy: { earnedAt: 'desc' } }),
      prisma.voucher.findMany({ where: { patientId: patient.id }, orderBy: { claimedAt: 'desc' } }),
    ])

    res.json({ tokenBalance: tokens.filter((t) => !t.redeemed).length, tokens, vouchers })
  })
)

// POST /api/patients/:hn/rewards/redeem
// [AC-04] Converts one unredeemed discipline token into a unique 15%
// pharmacy discount code, scannable at a partner pharmacy.
rewardsRouter.post(
  '/rewards/redeem',
  asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findUnique({ where: { hn: req.params.hn } })
    if (!patient) throw new ApiError(404, 'ไม่พบผู้ป่วยรายนี้')

    const token = await prisma.rewardToken.findFirst({ where: { patientId: patient.id, redeemed: false } })
    if (!token) throw new ApiError(409, 'ไม่มีเหรียญตราแห่งวินัยที่พร้อมแลก')

    const [, voucher] = await prisma.$transaction([
      prisma.rewardToken.update({ where: { id: token.id }, data: { redeemed: true } }),
      prisma.voucher.create({
        data: { patientId: patient.id, code: randomPromoCode(), discountPercent: 15 },
      }),
    ])

    res.status(201).json(voucher)
  })
)

// POST /api/patients/:hn/rewards/grant
// Grants a discipline token for patient discipline/achievements
rewardsRouter.post(
  '/rewards/grant',
  asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findUnique({ where: { hn: req.params.hn } })
    if (!patient) throw new ApiError(404, 'ไม่พบผู้ป่วยรายนี้')

    const token = await prisma.rewardToken.create({
      data: { patientId: patient.id },
    })

    res.status(201).json(token)
  })
)
