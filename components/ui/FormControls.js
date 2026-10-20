'use client'

import { useState } from 'react'
import { ChevronDown, CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react'
import styles from './form.module.css'

const cx = (...classes) => classes.filter(Boolean).join(' ')

function FieldShell({ id, label, invalid, hint, aside, children }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={cx(styles.control, invalid && styles.controlInvalid)}>{children}</div>
      {(hint || aside) && (
        <div className={styles.fieldFooter}>
          {hint && (
            <p id={`${id}-hint`} className={styles.hint}>
              {hint}
            </p>
          )}
          {aside}
        </div>
      )}
    </div>
  )
}

// Atribut aksesibilitas yang sama untuk semua jenis kontrol.
const a11y = (id, invalid, hint) => ({
  id,
  'aria-invalid': invalid || undefined,
  'aria-describedby': hint ? `${id}-hint` : undefined,
})

export function TextField({ id, label, invalid, hint, ...inputProps }) {
  return (
    <FieldShell id={id} label={label} invalid={invalid} hint={hint}>
      <input className={styles.input} {...a11y(id, invalid, hint)} {...inputProps} />
    </FieldShell>
  )
}

export function PasswordField({ id, label, invalid, hint, ...inputProps }) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? Eye : EyeOff

  return (
    <FieldShell id={id} label={label} invalid={invalid} hint={hint}>
      <input
        className={styles.input}
        type={visible ? 'text' : 'password'}
        {...a11y(id, invalid, hint)}
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
    </FieldShell>
  )
}

export function SelectField({ id, label, invalid, hint, placeholder, options, value, ...selectProps }) {
  return (
    <FieldShell id={id} label={label} invalid={invalid} hint={hint}>
      <select
        className={cx(styles.input, styles.select, !value && styles.placeholder)}
        value={value}
        {...a11y(id, invalid, hint)}
        {...selectProps}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className={styles.trailingIcon} aria-hidden="true" />
    </FieldShell>
  )
}

export function TextAreaField({ id, label, invalid, hint, value, maxLength, ...textareaProps }) {
  const counter = maxLength && (
    <span className={cx(styles.counter, value.length >= maxLength && styles.counterLimit)} aria-live="polite">
      {value.length}/{maxLength}
    </span>
  )

  return (
    <FieldShell id={id} label={label} invalid={invalid} hint={hint} aside={counter}>
      <textarea
        className={cx(styles.input, styles.textarea)}
        value={value}
        maxLength={maxLength}
        {...a11y(id, invalid, hint)}
        {...textareaProps}
      />
    </FieldShell>
  )
}

export function StatusBanner({ status, size }) {
  if (!status) return null
  const isError = status.type === 'error'
  const Icon = isError ? CircleAlert : CircleCheck

  return (
    <div
      className={cx(
        styles.banner,
        size === 'large' && styles.bannerLarge,
        isError ? styles.bannerError : styles.bannerSuccess
      )}
      role={isError ? 'alert' : 'status'}
    >
      <Icon size={size === 'large' ? 20 : 16} aria-hidden="true" />
      <ul className={styles.bannerMessages}>
        {status.messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
