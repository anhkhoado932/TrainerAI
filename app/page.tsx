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
    <div className="flex flex-col min-h-screen bg-black">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-foreground">PT+</div>
          <nav className="flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <SignOutButton variant="ghost" />
                <Avatar>
                  <AvatarFallback>
                    {session.user.email?.[0].toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="relative py-24 lg:py-32 bg-black overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                PT+
              </h1>
              <p className="text-2xl md:text-3xl font-medium text-primary mb-6">
                Your Personal AI Fitness Companion
              </p>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Personalized workout plans, real-time form correction, and adaptive training - all powered by AI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="#features">Learn More</a>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />
          </div>
        </section>
        
        <section id="features" className="py-20 bg-black relative">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
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
                  className="border-border bg-black/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground/80">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-black/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-semibold mb-8">Trusted by Fitness Enthusiasts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {['1000+', '95%', '50+', '24/7'].map((stat, index) => (
                <div key={index} className="p-4">
                  <div className="text-3xl font-bold text-primary mb-2">{stat}</div>
                  <div className="text-sm text-muted-foreground">
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
      
      <footer className="bg-black py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl mb-2 text-foreground">PT+</div>
              <p className="text-muted-foreground">Your Personal AI Fitness Companion</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} PT+. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 