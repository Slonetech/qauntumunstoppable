/** Format numeric price for display (matches legacy mock string style). */
export function formatPrice(value, asset = '') {
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  const isFx = asset.includes('/') && !asset.includes('BTC') && !asset.includes('ETH')
  const decimals = isFx || n < 10 ? 4 : n >= 1000 ? 2 : 2
  const formatted = n.toLocaleString('en-US', {
    minimumFractionDigits: decimals > 2 ? 4 : 0,
    maximumFractionDigits: decimals,
  })
  return formatted
}

/** Map API signal → shape expected by Dashboard cards + SignalChart modal. */
export function toDisplaySignal(s) {
  const up = s.action === 'BUY'
  return {
    id: s.id,
    asset: s.asset,
    action: s.action,
    bias: s.bias,
    conf: s.confidencePct,
    entry: formatPrice(s.entryPrice, s.asset),
    tp: formatPrice(s.takeProfit, s.asset),
    sl: formatPrice(s.stopLoss, s.asset),
    timeframe: s.timeframe,
    modelVersion: s.modelVersion,
    status: s.status,
    createdAt: s.createdAt,
    up,
    pnl: statusPnlLabel(s),
    entryPrice: s.entryPrice,
    takeProfit: s.takeProfit,
    stopLoss: s.stopLoss,
  }
}

function statusPnlLabel(s) {
  if (s.status === 'OPEN') return 'Active'
  return s.action === 'BUY' ? '+Closed' : '−Closed'
}
