export function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

