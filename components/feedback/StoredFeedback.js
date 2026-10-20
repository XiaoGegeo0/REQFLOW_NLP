'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { formatFeedbackId, formatTanggal } from '../../lib/feedback'
import PageHeader from '../app/PageHeader'
import app from '../app/app.module.css'
import ui from '../ui/form.module.css'
import styles from './StoredFeedback.module.css'

const COLUMNS = 'id, title, source, feedback_date, content'

// Sementara untuk halaman Generate User Story: menampilkan feedback tersimpan (FR-04-01).
// Proses NLP generate user story dibangun pada UC-04.
export default function StoredFeedback({ feedbackId }) {
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    let cancelled = false

    async function load() {
      // RLS memastikan hanya feedback milik analyst yang login yang terbaca.
      const query = feedbackId
        ? supabase.from('feedback_stakeholder').select(COLUMNS).eq('id', feedbackId).maybeSingle()
        : supabase.from('feedback_stakeholder').select(COLUMNS).order('created_at', { ascending: false })
      const { data, error } = await query
      if (error) console.error(`Gagal memuat feedback: [${error.code}] ${error.message}`)
      if (!cancelled) setState({ loading: false, data, error })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [feedbackId])

  return (
    <>
      <PageHeader
        breadcrumb={['Beranda', 'Generate User Story']}
        title="Generate User Story"
        description={
          feedbackId
            ? 'Periksa feedback stakeholder yang akan diproses menjadi draft user story.'
            : 'Pilih feedback stakeholder yang akan diproses menjadi draft user story.'
        }
      />
      <section className={app.card}>{renderContent(state, feedbackId)}</section>
    </>
  )
}

function renderContent({ loading, data, error }, feedbackId) {
  if (loading) return <p className={app.cardText}>Memuat feedback...</p>
  if (error) return <p className={app.cardText}>Feedback gagal dimuat. Silakan muat ulang halaman.</p>

  if (!feedbackId) {
    if (data.length === 0) {
      return (
        <p className={app.cardText}>
          Belum ada feedback tersimpan.{' '}
          <Link href="/input-feedback" className={styles.link}>
            Input feedback stakeholder
          </Link>
        </p>
      )
    }
    return (
      <>
        <h2 className={app.cardTitle}>Feedback Tersimpan</h2>
        <ul className={styles.list}>
          {data.map((fb) => (
            <li key={fb.id} className={styles.listItem}>
              <Link href={`/generate-user-story?feedback=${fb.id}`} className={styles.listLink}>
                <span className={styles.listTitle}>{fb.title}</span>
                <span className={styles.meta}>
                  {formatFeedbackId(fb.id)} • {fb.source} • {formatTanggal(fb.feedback_date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </>
    )
  }

  if (!data) {
    return (
      <p className={app.cardText}>
        Feedback tidak ditemukan.{' '}
        <Link href="/generate-user-story" className={styles.link}>
          Lihat daftar feedback
        </Link>
      </p>
    )
  }

  return (
    <>
      <h2 className={app.cardTitle}>{data.title}</h2>
      <dl className={styles.details}>
        <dt>ID Feedback</dt>
        <dd>{formatFeedbackId(data.id)}</dd>
        <dt>Sumber Feedback</dt>
        <dd>{data.source}</dd>
        <dt>Tanggal Perolehan</dt>
        <dd>{formatTanggal(data.feedback_date)}</dd>
      </dl>
      <div className={styles.content}>{data.content}</div>
      <div className={styles.actions}>
        <Link href="/generate-user-story" className={styles.link}>
          ← Pilih feedback lain
        </Link>
        <button type="button" className={ui.button} disabled title="Proses NLP dibangun pada UC-04">
          <Sparkles size={16} aria-hidden="true" />
          Generate User Story
        </button>
      </div>
    </>
  )
}
