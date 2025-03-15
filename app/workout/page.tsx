import { WorkoutPlanView } from "@/components/workout/workout-plan-view"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function WorkoutPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('user_data')
    .select('workout_plan')
    .eq('user_id_fk', user.id)
    .single()

  if (!userData?.workout_plan) redirect('/assessment')

  return (
    <div className="container max-w-5xl py-8">
      <WorkoutPlanView workoutPlan={userData.workout_plan} />
    </div>
  )
} 