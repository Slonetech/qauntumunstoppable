import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000)

const signals = [
  {
    asset: 'BTC/USD',
    action: 'BUY',
    bias: 'Bullish',
    confidencePct: 94,
    entryPrice: 67842.5,
    takeProfit: 72100,
    stopLoss: 65400,
    timeframe: '15M',
    modelVersion: 'v4.2',
    status: 'OPEN',
    createdAt: hoursAgo(1),
  },
  {
    asset: 'ETH/USD',
    action: 'BUY',
    bias: 'Bullish',
    confidencePct: 91,
    entryPrice: 3521.8,
    takeProfit: 3740,
    stopLoss: 3380,
    timeframe: '15M',
    modelVersion: 'v4.2',
    status: 'OPEN',
    createdAt: hoursAgo(2),
  },
  {
    asset: 'XAU/USD',
    action: 'BUY',
    bias: 'Bullish',
    confidencePct: 88,
    entryPrice: 2341.6,
    takeProfit: 2398,
    stopLoss: 2298,
    timeframe: '1H',
    modelVersion: 'v4.2',
    status: 'OPEN',
    createdAt: hoursAgo(3),
  },
  {
    asset: 'EUR/USD',
    action: 'SELL',
    bias: 'Bearish',
    confidencePct: 76,
    entryPrice: 1.0921,
    takeProfit: 1.085,
    stopLoss: 1.098,
    timeframe: '15M',
    modelVersion: 'v4.2',
    status: 'CLOSED',
    createdAt: hoursAgo(5),
  },
  {
    asset: 'AAPL',
    action: 'BUY',
    bias: 'Bullish',
    confidencePct: 82,
    entryPrice: 198.42,
    takeProfit: 205.5,
    stopLoss: 194.8,
    timeframe: '1H',
    modelVersion: 'v4.2',
    status: 'OPEN',
    createdAt: hoursAgo(6),
  },
  {
    asset: 'BTC/USD',
    action: 'SELL',
    bias: 'Bearish',
    confidencePct: 79,
    entryPrice: 68120,
    takeProfit: 66800,
    stopLoss: 69200,
    timeframe: '4H',
    modelVersion: 'v4.2',
    status: 'CLOSED',
    createdAt: hoursAgo(8),
  },
  {
    asset: 'ETH/USD',
    action: 'SELL',
    bias: 'Bearish',
    confidencePct: 73,
    entryPrice: 3588,
    takeProfit: 3420,
    stopLoss: 3665,
    timeframe: '15M',
    modelVersion: 'v4.2',
    status: 'CLOSED',
    createdAt: hoursAgo(12),
  },
  {
    asset: 'XAU/USD',
    action: 'SELL',
    bias: 'Bearish',
    confidencePct: 85,
    entryPrice: 2358.2,
    takeProfit: 2320,
    stopLoss: 2385,
    timeframe: '1H',
    modelVersion: 'v4.2',
    status: 'OPEN',
    createdAt: hoursAgo(18),
  },
  {
    asset: 'EUR/USD',
    action: 'BUY',
    bias: 'Bullish',
    confidencePct: 71,
    entryPrice: 1.0885,
    takeProfit: 1.0942,
    stopLoss: 1.084,
    timeframe: '15M',
    modelVersion: 'v4.2',
    status: 'OPEN',
    createdAt: hoursAgo(24),
  },
  {
    asset: 'AAPL',
    action: 'SELL',
    bias: 'Bearish',
    confidencePct: 68,
    entryPrice: 201.15,
    takeProfit: 195.4,
    stopLoss: 204.9,
    timeframe: '4H',
    modelVersion: 'v4.2',
    status: 'CLOSED',
    createdAt: hoursAgo(36),
  },
]

async function main() {
  await prisma.signal.deleteMany()

  for (const s of signals) {
    await prisma.signal.create({ data: s })
  }

  console.log(`Seeded ${signals.length} signals.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
