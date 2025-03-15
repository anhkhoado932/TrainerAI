import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workout Exercise",
  description: "Start your workout exercise",
}

export default function WorkoutStartLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <section className="min-h-screen bg-gradient-to-b from-background to-background/80 py-8">
      {children}
    </section>
  )
} 