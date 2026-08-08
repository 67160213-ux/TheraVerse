import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'NOT_FOUND', message: `ไม่พบเส้นทาง ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
      details: err.flatten(),
    })
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.name, message: err.message, details: err.details })
  }

  // Prisma unique constraint violations etc. are surfaced generically to
  // avoid leaking internal schema details to clients.
  console.error(err)
  return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' })
}
