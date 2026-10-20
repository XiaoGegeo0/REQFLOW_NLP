import AppShell from '../../components/app/AppShell'

// Semua halaman di grup (app) membutuhkan login dan memakai topbar + sidebar.
export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>
}
