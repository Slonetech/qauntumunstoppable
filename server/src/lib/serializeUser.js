export function serializeUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phone: user.phone,
    investment: user.investmentLevel,
    tier: formatTier(user.tier),
    balance: Number(user.balance),
    createdAt: user.createdAt,
  }
}

export function formatTier(tier) {
  if (!tier) return 'Starter'
  const t = String(tier)
  return t.charAt(0) + t.slice(1).toLowerCase()
}

export function parseTierInput(value) {
  if (!value) return 'STARTER'
  const normalized = String(value).trim().toUpperCase()
  if (normalized === 'PRO') return 'PRO'
  if (normalized === 'ELITE') return 'ELITE'
  return 'STARTER'
}
