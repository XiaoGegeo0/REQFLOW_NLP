'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [status, setStatus] = useState('Sedang mengecek koneksi ke Supabase...')
  const [data, setData] = useState(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        // Coba query sederhana ke Supabase
        const { data, error } = await supabase.from('test').select('*').limit(1)

        if (error) {
          // Jika tabel 'test' belum dibuat, ini tetap membuktikan koneksi API & URL kamu berhasil terhubung
          setStatus(`Status Koneksi: Terhubung ke Supabase! (Pesan: ${error.message})`)
        } else {
          setStatus('Status Koneksi: Berhasil terhubung & mengambil data!')
          setData(data)
        }
      } catch (err) {
        setStatus(`Gagal terhubung: ${err.message}`)
      }
    }

    checkConnection()
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>ReqFlow NLP x Supabase</h1>
      <p><strong>{status}</strong></p>
      
      {data && (
        <div>
          <h3>Data dari Supabase:</h3>
          <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </main>
  )
}