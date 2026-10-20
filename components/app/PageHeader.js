import styles from './app.module.css'

export default function PageHeader({ breadcrumb, title, description }) {
  return (
    <header className={styles.pageHeader}>
      <ol className={styles.breadcrumb} aria-label="Breadcrumb">
        {breadcrumb.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <h1 className={styles.pageTitle}>{title}</h1>
      {description && <p className={styles.pageDescription}>{description}</p>}
    </header>
  )
}
