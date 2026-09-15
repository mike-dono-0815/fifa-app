export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatDateRange(start: Date, end: Date): string {
  if (start.toDateString() === end.toDateString()) return formatDate(start)
  const sameYear = start.getFullYear() === end.getFullYear()
  const startLabel = start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
  return `${startLabel} – ${formatDate(end)}`
}
