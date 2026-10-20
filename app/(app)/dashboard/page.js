'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { useCurrentAnalyst } from '../../../components/app/AppShell'
import PageHeader from '../../../components/app/PageHeader'
import app from '../../../components/app/app.module.css'
import ui from '../../../components/ui/form.module.css'

export default function DashboardPage() {
  const analyst = useCurrentAnalyst()

  return (
    <>
      <PageHeader breadcrumb={['Beranda']} title={`Halo, ${analyst.nama}`} />
      <section className={app.card} style={{ maxWidth: 640 }}>
        <h2 className={app.cardTitle}>Mulai dari feedback stakeholder</h2>
        <p className={app.cardText}>
          Catat feedback dari wawancara, rapat, atau email, lalu proses menjadi draft user story.
        </p>
        <div>
          <Link href="/input-feedback" className={ui.button}>
            <MessageSquare size={16} aria-hidden="true" />
            Input Feedback
          </Link>
        </div>
      </section>
    </>
  )
}
