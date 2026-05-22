import net from 'net'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const url = process.env.DATABASE_URL || ''
const match = url.match(/@([^:/]+):(\d+)\//)
const host = match?.[1] || 'localhost'
const port = Number(match?.[2] || 5432)
const timeoutMs = 60_000
const intervalMs = 1_000

function tryConnect() {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port }, () => {
      socket.end()
      resolve(true)
    })
    socket.setTimeout(2000)
    socket.on('error', () => resolve(false))
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
  })
}

const started = Date.now()
console.log(`Waiting for PostgreSQL at ${host}:${port}...`)

while (Date.now() - started < timeoutMs) {
  if (await tryConnect()) {
    console.log('Database port is open.')
    process.exit(0)
  }
  await new Promise((r) => setTimeout(r, intervalMs))
}

console.error(`
Cannot reach PostgreSQL at ${host}:${port}.

Start the database first (from project root):
  bash scripts/start-database.sh

Or with sudo if Docker permission denied:
  sudo docker compose up -d

Or use SQLite for local dev (no Docker):
  npm run db:migrate:sqlite
`)
process.exit(1)
