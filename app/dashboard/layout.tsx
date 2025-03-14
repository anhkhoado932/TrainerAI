import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | UniHack 2025',
  description: 'Manage your UniHack 2025 projects, teams, and events',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  )
} 