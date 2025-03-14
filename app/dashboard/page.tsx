'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-black flex items-center gap-2">
            <Icons.logo className="h-6 w-6 text-[#F26430]" />
            PT<span className="text-[#F26430]">+</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-[#F26430] transition-colors"
            >
              Home
            </Link>
            <SignOutButton variant="ghost" />
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#F26430] text-white text-lg">
                A
              </AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-black sm:text-5xl">
              Welcome to Your Fitness Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Let's create your personalized fitness plan with our AI-powered assessment
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="relative bg-white border-gray-200 hover:shadow-lg hover:shadow-[#F26430]/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Icons.fileText className="h-5 w-5 text-[#F26430]" />
                  Assessment
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Complete a quick assessment to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  className="w-full bg-[#F26430] hover:bg-[#F26430]/90 text-white py-6 text-lg font-medium rounded-xl hover:scale-105 transition-all duration-300" 
                  asChild
                >
                  <Link 
                    href="/assessment" 
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Start Assessment</span>
                    <Icons.arrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg hover:shadow-[#F26430]/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Icons.more className="h-5 w-5 text-[#F26430]" />
                  Workouts
                </CardTitle>
                <CardDescription className="text-gray-600">
                  View your personalized workout plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-2 border-gray-200 text-gray-600 hover:border-[#F26430]/30 hover:text-[#F26430]" 
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg hover:shadow-[#F26430]/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Icons.chart className="h-5 w-5 text-[#F26430]" />
                  Progress
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Track your fitness journey progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-2 border-gray-200 text-gray-600 hover:border-[#F26430]/30 hover:text-[#F26430]" 
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#F26430]/5 border border-[#F26430]/10 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600">
              Complete your assessment to unlock personalized workout plans and progress tracking
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 