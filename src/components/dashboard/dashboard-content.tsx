"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

interface DashboardContentProps {
  hasAssessment: boolean
  hasWorkoutPlan: boolean
}

export function DashboardContent({ hasAssessment, hasWorkoutPlan }: DashboardContentProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-foreground flex items-center gap-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            PT+
          </div>
          <nav className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <SignOutButton variant="ghost" />
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              Welcome to Your Fitness Journey
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {hasAssessment 
                ? "Track your progress and follow your personalized workout plan"
                : "Let's create your personalized fitness plan with our AI-powered assessment"
              }
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className={`relative bg-card/50 backdrop-blur-sm border-transparent hover:border-transparent transition-colors group/card ${hasAssessment ? 'opacity-50' : ''}`}>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-red-500 via-yellow-500 via-green-500 to-blue-500 animate-gradient-x opacity-75 blur group-hover/card:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-[1px] rounded-lg bg-card/90 backdrop-blur-xl" />
              <div className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.fileText className="h-5 w-5 text-primary" />
                    Assessment
                  </CardTitle>
                  <CardDescription>
                    {hasAssessment 
                      ? "View your assessment results"
                      : "Complete a quick assessment to get started"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="lg" 
                    className="relative w-full group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg hover:shadow-blue-500/25 transition-all duration-300" 
                    asChild
                  >
                    <Link 
                      href="/assessment" 
                      className="relative flex items-center justify-center gap-2 py-8 text-lg font-medium"
                    >
                      <span className="text-white font-semibold">
                        {hasAssessment ? "View Results" : "Start Assessment"}
                      </span>
                      <Icons.arrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </Button>
                </CardContent>
              </div>
            </Card>

            <Card className={`relative bg-card/50 backdrop-blur-sm border-transparent hover:border-transparent transition-colors group/card ${!hasWorkoutPlan ? 'opacity-50' : ''}`}>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-red-500 via-yellow-500 via-green-500 to-blue-500 animate-gradient-x opacity-75 blur group-hover/card:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-[1px] rounded-lg bg-card/90 backdrop-blur-xl" />
              <div className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.dumbbell className="h-5 w-5 text-primary" />
                    Workouts
                  </CardTitle>
                  <CardDescription>
                    {hasWorkoutPlan 
                      ? "Follow your personalized workout plan"
                      : "Complete the assessment to unlock your plan"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="lg" 
                    className="relative w-full group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg hover:shadow-blue-500/25 transition-all duration-300" 
                    asChild={hasWorkoutPlan}
                    disabled={!hasWorkoutPlan}
                  >
                    {hasWorkoutPlan ? (
                      <Link 
                        href="/workout" 
                        className="relative flex items-center justify-center gap-2 py-8 text-lg font-medium"
                      >
                        <span className="text-white font-semibold">
                          View Workout Plan
                        </span>
                        <Icons.arrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    ) : (
                      <span className="py-8 text-lg font-medium">Complete Assessment First</span>
                    )}
                  </Button>
                </CardContent>
              </div>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.chart className="h-5 w-5 text-primary" />
                  Progress
                </CardTitle>
                <CardDescription>
                  Track your fitness journey progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" variant="secondary" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {hasAssessment 
                ? "Track your progress and stay motivated with your personalized fitness journey"
                : "Complete your assessment to unlock personalized workout plans and progress tracking"
              }
            </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
          background-size: 400% 400%;
        }
      `}</style>
    </div>
  )
} 