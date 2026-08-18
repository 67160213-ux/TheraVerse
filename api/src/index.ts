import 'dotenv/config'
import { createApp } from './app'
import { prisma } from './lib/prisma'

const PORT = Number(process.env.PORT ?? 4000)

const app = createApp()

const server = app.listen(PORT, () => {
  console.log(`🩺 Therapeutics API listening on port ${PORT}`)
  console.log(`   Docs: http://localhost:${PORT}/api/docs`)
})

async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down gracefully...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
