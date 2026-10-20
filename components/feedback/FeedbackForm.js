'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Save } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { MAX_ISI_FEEDBACK, MAX_JUDUL_FEEDBACK, SUMBER_FEEDBACK, todayLocalISO } from '../../lib/feedback'
import { useCurrentAnalyst } from '../app/AppShell'
import PageHeader from '../app/PageHeader'
import { SelectField, StatusBanner, TextAreaField, TextField } from '../ui/FormControls'
import app from '../app/app.module.css'
import ui from '../ui/form.module.css'
import styles from './feedback.module.css'

const EMPTY_FORM = { judul: '', sumber: '', tanggal: '', isi: '' }

// SRS UC-03 Exception Flow 1: tandai field kosong; pesan khusus bila isi feedback kosong.
function validate(form) {
  const invalid = {
    judul: !form.judul.trim(),
    sumber: !form.sumber,
    tanggal: !form.tanggal,
    isi: !form.isi.trim(),
  }
  const messages = []
  if (invalid.isi) messages.push('Feedback stakeholder harus diisi.')
  if (invalid.judul || invalid.sumber || invalid.tanggal) messages.push('Lengkapi seluruh field wajib.')
  if (form.tanggal && form.tanggal > todayLocalISO()) {
    invalid.tanggal = true
    messages.push('Tanggal perolehan tidak boleh melebihi hari ini.')
  }
  return { invalid, messages }
}

export default function FeedbackForm() {
  const router = useRouter()
  const analyst = useCurrentAnalyst()
  const [form, setForm] = useState(EMPTY_FORM)
  const [invalid, setInvalid] = useState({})
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState(null)

  // Mengubah form setelah tersimpan berarti menyusun feedback baru.
  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setInvalid((prev) => ({ ...prev, [field]: false }))
    if (savedId !== null) {
      setSavedId(null)
      setStatus(null)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return

    const validation = validate(form)
    setInvalid(validation.invalid)
    if (validation.messages.length > 0) {
      setStatus({ type: 'error', messages: validation.messages })
      return
    }

    setStatus(null)
    setSaving(true)

    const { data, error } = await supabase
      .from('feedback_stakeholder')
      .insert({
        user_id: analyst.id,
        title: form.judul.trim(),
        source: form.sumber,
        feedback_date: form.tanggal,
        content: form.isi.trim(),
      })
      .select('id')
      .single()

    setSaving(false)

    // SRS UC-03 Exception Flow 2: data form dipertahankan.
    if (error) {
      console.error(`Gagal menyimpan feedback: [${error.code}] ${error.message}`, error.details ?? '', error.hint ?? '')
      setStatus({ type: 'error', messages: ['Feedback gagal disimpan. Silakan coba kembali.'] })
      return
    }

    setSavedId(data.id)
    setStatus({ type: 'success', messages: ['Feedback berhasil disimpan.'] })
  }

  return (
    <>
      <PageHeader
        breadcrumb={['Beranda', 'Input Feedback']}
        title="Input Feedback Stakeholder"
        description="Masukkan feedback stakeholder yang diperoleh dari wawancara, rapat, atau komunikasi lain."
      />

      <div className={styles.contentRow}>
        <section className={`${app.card} ${styles.formCard}`}>
          <h2 className={app.cardTitle}>Form Input Feedback</h2>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <TextField
              id="judul"
              label="Judul Feedback *"
              placeholder="Contoh: Hasil wawancara stakeholder — Modul Laporan"
              maxLength={MAX_JUDUL_FEEDBACK}
              value={form.judul}
              invalid={invalid.judul}
              onChange={update('judul')}
            />
            <SelectField
              id="sumber"
              label="Sumber Feedback *"
              placeholder="Pilih sumber: Wawancara / Rapat / Email"
              options={SUMBER_FEEDBACK}
              value={form.sumber}
              invalid={invalid.sumber}
              onChange={update('sumber')}
            />
            <TextField
              id="tanggal"
              label="Tanggal Perolehan *"
              type="date"
              max={todayLocalISO()}
              value={form.tanggal}
              invalid={invalid.tanggal}
              onChange={update('tanggal')}
            />
            <TextAreaField
              id="isi"
              label="Isi Feedback Stakeholder *"
              placeholder='Tuliskan feedback stakeholder di sini. Contoh: "Stakeholder ingin dapat mengunduh laporan penjualan bulanan agar mudah dibagikan ke manajemen."'
              maxLength={MAX_ISI_FEEDBACK}
              value={form.isi}
              invalid={invalid.isi}
              onChange={update('isi')}
            />
            <p className={styles.note}>* Seluruh kolom wajib diisi. Sistem akan memvalidasi sebelum menyimpan.</p>
            <div className={styles.actions}>
              <button type="submit" className={ui.button} disabled={saving || savedId !== null}>
                <Save size={16} aria-hidden="true" />
                {saving ? 'Menyimpan...' : 'Simpan Feedback'}
              </button>
            </div>
          </form>
        </section>

        <aside className={`${app.card} ${styles.sideCard}`}>
          <h2 className={app.cardTitle}>Langkah Berikutnya</h2>
          <p className={app.cardText}>
            Setelah feedback tersimpan, lanjutkan ke proses pembuatan draft user story.
          </p>
          <button
            type="button"
            className={`${ui.button} ${ui.buttonBlock}`}
            disabled={savedId === null}
            onClick={() => router.push(`/generate-user-story?feedback=${savedId}`)}
          >
            <ArrowRight size={16} aria-hidden="true" />
            Lanjut ke Generate User Story
          </button>
        </aside>
      </div>

      <StatusBanner status={status} size="large" />
    </>
  )
}
