import { FileCheck, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react'
import styles from './auth.module.css'

const BENEFITS = [
  { icon: MessageSquare, label: 'Input feedback stakeholder' },
  { icon: Sparkles, label: 'Generate user story otomatis (NLP)' },
  { icon: ShieldCheck, label: 'Review, verifikasi, dan revisi' },
  { icon: FileCheck, label: 'Dokumen user story final' },
]

export default function AuthLayout({ headline, title, subtitle, children }) {
  return (
    <main className={styles.page}>
      <section className={styles.brand}>
        <span className={styles.logo}>REQFLOW</span>
        <div className={styles.accent} />
        <h2 className={styles.headline}>{headline}</h2>
        <p className={styles.tagline}>
          Ubah feedback stakeholder menjadi user story yang terstruktur, terverifikasi, dan siap
          didokumentasikan.
        </p>
        <ul className={styles.benefits}>
          {BENEFITS.map(({ icon: Icon, label }) => (
            <li key={label} className={styles.benefit}>
              <Icon size={16} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.card}>
          <header className={styles.intro}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </header>
          {children}
        </div>
      </section>
    </main>
  )
}
