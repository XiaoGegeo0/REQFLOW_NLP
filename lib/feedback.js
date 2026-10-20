// Aturan data feedback_stakeholder — harus sama dengan supabase/migrations/002_feedback_stakeholder.sql
export const SUMBER_FEEDBACK = ['Wawancara', 'Rapat', 'Email', 'Lainnya']
export const MAX_JUDUL_FEEDBACK = 255
export const MAX_ISI_FEEDBACK = 500

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isFeedbackId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

// ID tampilan dari uuid, mis. "3f2a9c1e-…" → "FB-3F2A9C1E".
export function formatFeedbackId(id) {
  return `FB-${id.slice(0, 8).toUpperCase()}`
}

// Kolom date ("2026-10-20") diformat tanpa pergeseran zona waktu.
export function formatTanggal(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// Tanggal hari ini menurut zona waktu pengguna, format YYYY-MM-DD (untuk atribut max input date).
export function todayLocalISO() {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}
