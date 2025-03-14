import { AssessmentForm } from "./assessment-form"
import { AssessmentResults } from "@/src/components/assessment/assessment-results"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AssessmentPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('user_data')
    .select('assessment, workout_plan')
    .eq('user_id_fk', user.id)
    .single()

  // If user has already completed assessment, show results
  if (userData?.assessment) {
    return (
      <div className="min-h-screen">
        <AssessmentResults assessment={userData.assessment} workoutPlan={userData.workout_plan} />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AssessmentForm />
    </div>
  )
} 