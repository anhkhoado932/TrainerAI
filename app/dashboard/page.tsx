import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/src/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('user_data')
    .select('assessment, workout_plan')
    .eq('user_id_fk', user.id)
    .single()

  const hasAssessment = Boolean(userData?.assessment)
  const hasWorkoutPlan = Boolean(userData?.workout_plan)
  console.log(hasAssessment, hasWorkoutPlan)
  return <DashboardContent hasAssessment={hasAssessment} hasWorkoutPlan={hasWorkoutPlan} />
} 