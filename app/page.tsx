import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-black">PT+</div>
          <nav className="flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Dashboard
                </Link>
                <SignOutButton variant="ghost" />
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-200 text-black text-lg">
                    {session.user.email?.[0].toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-black text-white px-4 py-2 text-sm font-medium shadow transition-colors hover:bg-black/90"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="relative py-24 lg:py-28 bg-white overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-black">
                PT+
              </h1>
              <p className="text-2xl md:text-3xl font-medium text-black mb-6">
                Your Personal AI Fitness Companion
              </p>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                Personalized workout plans, real-time form correction, and adaptive training - all powered by AI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-lg rounded-xl hover:scale-105 transition-transform bg-black text-white"
                  asChild
                >
                  <Link href="/dashboard">
                    Get Started
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto px-8 py-6 text-lg rounded-xl border-2 border-black text-white hover:scale-105 transition-transform"
                  asChild
                >
                  <a href="#features">
                    Learn More
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gray-100 rounded-full blur-3xl" />
          </div>
        </section>
        
        <section id="features" className="py-3 bg-white relative">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-black">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Workout Plans",
                  description: "AI-generated workout plans tailored to your fitness level, goals, and available equipment.",
                  icon: "🎯"
                },
                {
                  title: "Form Analysis",
                  description: "Real-time feedback on your exercise form to prevent injuries and maximize results.",
                  icon: "📊"
                },
                {
                  title: "Progress Tracking",
                  description: "Detailed analytics and insights to track your fitness journey and celebrate milestones.",
                  icon: "📈"
                }
              ].map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-gray-200 bg-white hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl text-black">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-semibold mb-8 text-black">Trusted by Fitness Enthusiasts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {['1000+', '95%', '50+', '24/7'].map((stat, index) => (
                <div key={index} className="p-4">
                  <div className="text-3xl font-bold text-black mb-2">{stat}</div>
                  <div className="text-sm text-gray-600">
                    {index === 0 && 'Active Users'}
                    {index === 1 && 'Satisfaction Rate'}
                    {index === 2 && 'Exercise Types'}
                    {index === 3 && 'AI Support'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl mb-2 text-black">PT+</div>
              <p className="text-gray-600">Your Personal AI Fitness Companion</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">About</a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">Contact</a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">Privacy</a>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} PT+. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 