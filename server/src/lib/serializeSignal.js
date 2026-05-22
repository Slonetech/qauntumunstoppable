export function serializeSignal(row) {
  return {
    id: row.id,
    asset: row.asset,
    action: row.action,
    bias: row.bias,
    confidencePct: row.confidencePct,
    entryPrice: Number(row.entryPrice),
    takeProfit: Number(row.takeProfit),
    stopLoss: Number(row.stopLoss),
    timeframe: row.timeframe,
    modelVersion: row.modelVersion,
    status: row.status,
    createdAt: row.createdAt,
  }
}

export function tierSignalLimit(tier) {
  switch (tier) {
    case 'ELITE':
      return undefined
    case 'PRO':
      return 10
    case 'STARTER':
    default:
      return 3
  }
}
