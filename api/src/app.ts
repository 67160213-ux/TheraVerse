import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'

import { patientsRouter } from './routes/patients'
import { devicesRouter } from './routes/devices'
import { sessionsRouter, sessionDetailRouter } from './routes/sessions'
import { battlesRouter } from './routes/battles'
import { clinicalReportsRouter, patientReportsRouter } from './routes/clinicalReports'
import { rewardsRouter } from './routes/rewards'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { openApiSpec } from './openapi'
import { prisma } from './lib/prisma'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }))
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      res.json({ status: 'ok', db: 'connected' })
    } catch {
      res.status(503).json({ status: 'degraded', db: 'unreachable' })
    }
  })

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

  // Patient resource + PDPA consent
  app.use('/api/patients', patientsRouter)

  // Nested under a patient's HN: device pairing, session start, reward wallet
  app.use('/api/patients/:hn/devices', devicesRouter)
  app.use('/api/patients/:hn/sessions', sessionsRouter)
  app.use('/api/patients/:hn', patientReportsRouter)
  app.use('/api/patients/:hn', rewardsRouter)

  // Flat under /sessions: progress ticks, completion, detail
  app.use('/api/sessions', sessionDetailRouter)
  // Flat under /sessions/:id: battle outcome, clinical report submission
  app.use('/api/sessions/:id', battlesRouter)
  app.use('/api/sessions/:id', clinicalReportsRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
