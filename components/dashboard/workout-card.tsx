import { WorkoutPlanView } from "@/components/workout/workout-plan-view"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface WorkoutCardProps {
  workoutPlan: any // Using the same WorkoutPlan type from workout-plan-view
}

export function WorkoutCard({ workoutPlan }: WorkoutCardProps) {
  if (!workoutPlan) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-[400px] flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-2xl font-semibold mb-2">No Workout Plan Yet</h3>
        <p className="text-muted-foreground mb-6">
          Complete the assessment to get your personalized workout plan
        </p>
        <Button asChild>
          <Link href="/assessment">
            Take Assessment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <WorkoutPlanView workoutPlan={workoutPlan} isCard />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <Button
        asChild
        className="absolute bottom-4 right-4 shadow-lg"
        variant="secondary"
      >
        <Link href="/workout">
          View Full Plan
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  )
} 