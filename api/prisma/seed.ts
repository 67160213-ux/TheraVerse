import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.patient.upsert({
    where: { hn: '6501234' },
    update: {},
    create: {
      hn: '6501234',
      name: 'ลุงสมศักดิ์',
      age: 62,
      condition: 'เบาหวานชนิดที่ 2 และไขมันในเลือดสูง',
      targetHrLow: 90,
      targetHrHigh: 128,
      dailyDistanceGoalM: 2000,
      consentGiven: false,
    },
  })
  console.log('Seeded demo patient HN 6501234 (ลุงสมศักดิ์)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
