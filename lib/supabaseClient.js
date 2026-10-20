import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Key baru Supabase bernama "publishable key"; "anon key" adalah nama lamanya.
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const REMEMBER_KEY = 'reqflow.remember'
const hasWindow = typeof window !== 'undefined'

// Sesi disimpan di localStorage bila "Ingat saya" aktif (default),
// selain itu di sessionStorage sehingga hilang saat tab/browser ditutup.
const sessionStorageAdapter = {
  getItem: (key) => (hasWindow ? localStorage.getItem(key) ?? sessionStorage.getItem(key) : null),
  setItem: (key, value) => {
    if (!hasWindow) return
    const remember = localStorage.getItem(REMEMBER_KEY) !== 'false'
    const [target, other] = remember ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
    target.setItem(key, value)
    other.removeItem(key)
  },
  removeItem: (key) => {
    if (!hasWindow) return
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export function setRememberMe(remember) {
  if (hasWindow) localStorage.setItem(REMEMBER_KEY, String(remember))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: sessionStorageAdapter },
})
