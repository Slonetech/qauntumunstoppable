import { useEffect, useState } from 'react'

const POLYGON_TICKERS = {
  'XAU/USD': 'C:XAUUSD',
  'EUR/USD': 'C:EURUSD',
  'GBP/USD': 'C:GBPUSD',
  'SPX500': 'I:SPX',
  'NASDAQ': 'I:NDX',
}

const DECIMAL_RULES = {
  'BTC/USD': { decimals: 2, comma: true },
  'ETH/USD': { decimals: 2, comma: true },
  'XRP/USD': { decimals: 2, comma: true },
  'XAU/USD': { decimals: 2, comma: true },
  'EUR/USD': { decimals: 5, comma: false },
  'GBP/USD': { decimals: 5, comma: false },
  'SPX500': { decimals: 2, comma: true },
  'NASDAQ': { decimals: 2, comma: true },
}

const INITIAL_PRICES = {
  'BTC/USD': { price: '—', change: '—', up: null },
  'ETH/USD': { price: '—', change: '—', up: null },
  'XRP/USD': { price: '—', change: '—', up: null },
  'XAU/USD': { price: '—', change: '—', up: null },
  'EUR/USD': { price: '—', change: '—', up: null },
  'GBP/USD': { price: '—', change: '—', up: null },
  'SPX500': { price: '—', change: '—', up: null },
  'NASDAQ': { price: '—', change: '—', up: null },
}

function formatPrice(val, asset) {
  const num = Number(val)
  if (isNaN(num)) return '—'
  const rule = DECIMAL_RULES[asset]
  if (!rule) return val.toString()
  if (rule.comma) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: rule.decimals,
      maximumFractionDigits: rule.decimals,
    })
  } else {
    return num.toFixed(rule.decimals)
  }
}

export function useLivePrices() {
  const [prices, setPrices] = useState(INITIAL_PRICES)

  useEffect(() => {
    let ws = null
    let reconnectTimeout = null
    let active = true

    // Binance WebSocket setup
    const connectBinance = () => {
      ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/xrpusdt@ticker')

      ws.onmessage = (event) => {
        if (!active) return
        try {
          const msg = JSON.parse(event.data)
          const stream = msg.stream
          const data = msg.data
          if (!data) return

          let pair = ''
          if (stream === 'btcusdt@ticker') pair = 'BTC/USD'
          else if (stream === 'ethusdt@ticker') pair = 'ETH/USD'
          else if (stream === 'xrpusdt@ticker') pair = 'XRP/USD'

          if (pair) {
            const priceVal = formatPrice(data.c, pair)
            const changeVal = Number(data.P)
            const changeText = (changeVal >= 0 ? '+' : '') + changeVal.toFixed(2) + '%'
            setPrices(prev => ({
              ...prev,
              [pair]: {
                price: priceVal,
                change: changeText,
                up: changeVal >= 0,
                source: 'Binance WebSocket',
              }
            }))
          }
        } catch (err) {
          console.error('[Binance WS parse error]', err)
        }
      }

      ws.onclose = () => {
        if (active) {
          console.log('[Binance WS closed] Reconnecting in 5s...')
          reconnectTimeout = setTimeout(connectBinance, 5000)
        }
      }

      ws.onerror = (err) => {
        console.error('[Binance WS error]', err)
        ws.close()
      }
    }

    connectBinance()

    // Polygon Polling setup
    const apiKey = import.meta.env.VITE_POLYGON_API_KEY

    const pollPolygon = async () => {
      if (!apiKey) {
        console.warn('[useLivePrices] Polygon VITE_POLYGON_API_KEY is missing.')
        return
      }

      const promises = Object.entries(POLYGON_TICKERS).map(async ([pair, ticker]) => {
        try {
          const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${apiKey}`)
          if (!res.ok) throw new Error(`Fetch failed for ${pair}`)
          const data = await res.json()
          const result = data.results?.[0]
          if (result) {
            const c = result.c // Close
            const o = result.o // Open
            const changeVal = ((c - o) / o) * 100
            const priceText = formatPrice(c, pair)
            const changeText = (changeVal >= 0 ? '+' : '') + changeVal.toFixed(2) + '%'
            return {
              pair,
              price: priceText,
              change: changeText,
              up: changeVal >= 0,
              source: 'Polygon API',
            }
          }
        } catch (err) {
          console.error(`[Polygon poll error for ${pair}]`, err)
        }
        return null
      })

      const results = await Promise.all(promises)
      if (!active) return

      setPrices(prev => {
        const next = { ...prev }
        results.forEach(res => {
          if (res) {
            next[res.pair] = {
              price: res.price,
              change: res.change,
              up: res.up,
              source: res.source,
            }
          }
        })
        return next
      })
    }

    pollPolygon() // Initial poll
    const intervalId = setInterval(pollPolygon, 3000)

    return () => {
      active = false
      if (ws) ws.close()
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      clearInterval(intervalId)
    }
  }, [])

  return prices
}
