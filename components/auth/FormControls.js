'use client'

import { useState } from 'react'
import { CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react'
import styles from './auth.module.css'

export function TextField({ id, label, invalid, hint, ...inputProps }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.inputWrap} ${invalid ? styles.inputWrapInvalid : ''}`}>
        <input id={id} className={styles.input} aria-invalid={invalid || undefined} {...inputProps} />
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}

export function PasswordField({ id, label, invalid, hint, ...inputProps }) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? Eye : EyeOff

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.inputWrap} ${invalid ? styles.inputWrapInvalid : ''}`}>
        <input
          id={id}
          className={styles.input}
          type={visible ? 'text' : 'password'}
          aria-invalid={invalid || undefined}
          {...inputProps}
        />
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          <Icon size={16} aria-hidden="true" />
        </button>
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}

export function StatusBanner({ status }) {
  if (!status) return null
  const isError = status.type === 'error'
  const Icon = isError ? CircleAlert : CircleCheck

  return (
    <div
      className={`${styles.banner} ${isError ? styles.bannerError : styles.bannerSuccess}`}
      role={isError ? 'alert' : 'status'}
    >
      <Icon size={16} aria-hidden="true" />
      <ul className={styles.bannerMessages}>
        {status.messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
