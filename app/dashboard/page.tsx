import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/app/components/dashboard/dashboard-content"
import Image from 'next/image'

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

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background Image with Gradient Overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/bg-pattern.jpg"
          alt="Background Pattern"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-white/60" />
      </div>

      {/* Pass the styling props to DashboardContent */}
      <DashboardContent 
        hasAssessment={hasAssessment} 
        hasWorkoutPlan={hasWorkoutPlan} 
      />
    </div>
  )
} 