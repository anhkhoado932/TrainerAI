import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-foreground">AI PT</div>
          <nav className="space-x-4">
            <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Login
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">AI PT</h1>
            <p className="text-2xl font-medium text-primary mb-6">Your Personal AI Fitness Companion</p>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Personalized workout plans, real-time form correction, and adaptive training - all powered by AI.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Get Started
              </Link>
              <a 
                href="#features" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-black px-8 py-3 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Workout Plans",
                  description: "AI-generated workout plans tailored to your fitness level, goals, and available equipment."
                },
                {
                  title: "Form Analysis",
                  description: "Real-time feedback on your exercise form to prevent injuries and maximize results."
                },
                {
                  title: "Progress Tracking",
                  description: "Detailed analytics and insights to track your fitness journey and celebrate milestones."
                }
              ].map((feature, index) => (
                <Card key={index} className="border-border bg-black hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-black py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl mb-2 text-foreground">AI PT</div>
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
            &copy; {new Date().getFullYear()} AI PT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 