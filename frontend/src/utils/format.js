export function formatSalary(min, max) {
  if (min == null && max == null) return '面议'
  return `${min ?? 0}-${max ?? 0}K`
}

export function formatDateTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

export function formatDate(value) {
  if (!value) return '-'
  return String(value).slice(0, 10)
}

export function clampScore(score) {
  return Math.max(0, Math.min(100, Number(score) || 0))
}
