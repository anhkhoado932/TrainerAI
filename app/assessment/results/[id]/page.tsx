import { prisma } from '@/lib/prisma'

export default async function ResultsPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const workoutPlan = await prisma.workoutPlan.findUnique({
    where: { assessmentId: id },
    include: { assessment: true },
  })

  if (!workoutPlan) {
    return <div>Loading...</div>
  }

  return (
    <div className="container max-w-4xl py-16">
      <h1 className="text-3xl font-bold mb-8">Your Personalized Workout Plan</h1>
      <div className="prose prose-lg">
        {/* Format and display the workout plan */}
        <pre>{workoutPlan.plan}</pre>
      </div>
    </div>
  )
} 