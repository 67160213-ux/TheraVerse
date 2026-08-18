import { prisma } from '../lib/prisma'
import { ApiError } from '../middleware/errorHandler'

export async function getConsentedPatientOrThrow(hn: string) {
  const patient = await prisma.patient.findUnique({ where: { hn } })
  if (!patient) throw new ApiError(404, 'ไม่พบผู้ป่วยรายนี้')
  if (!patient.consentGiven) throw new ApiError(403, 'ผู้ป่วยยังไม่ได้ยินยอมการเข้าถึงข้อมูลสุขภาพ (PDPA)')
  return patient
}
