export function currentTime(timeZone = 'Asia/Taipei', locale = 'zh-TW') {
  let zone = String(timeZone || 'Asia/Taipei')
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date())
  } catch {
    zone = 'UTC'
  }
  const now = new Date()
  let formatted
  try {
    formatted = new Intl.DateTimeFormat(locale || 'zh-TW', { timeZone: zone, dateStyle: 'full', timeStyle: 'long' }).format(now)
  } catch {
    formatted = new Intl.DateTimeFormat('zh-TW', { timeZone: zone, dateStyle: 'full', timeStyle: 'long' }).format(now)
  }
  return {
    now: now.toISOString(),
    timeZone: zone,
    formatted,
  }
}