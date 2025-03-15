import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Icons } from "@/components/ui/icons"

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background Image with Gradient Overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/bg-pattern.jpg" // Reference the image from public folder
          alt="Background Pattern"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Optional: Add a subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-white/60" /> {/* Adjust opacity as needed */}
      </div>

      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-black flex items-center gap-1">
              <Icons.dumbbell className="h-6 w-6 text-[#F26430]" />
              PT<span className="text-[#F26430]">+</span>
          </div>
          <nav className="flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-[#F26430] transition-colors"
                >
                  Dashboard
                </Link>
                <SignOutButton variant="ghost" />
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#F26430] text-white text-lg">
                    {session.user.email?.[0].toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-[#F26430] text-white px-4 py-2 text-sm font-medium shadow transition-colors hover:bg-[#F26430]/90"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow relative z-10">
        {/* Combined Hero, Features, and Image Section */}
        <section className="min-h-[calc(100vh-73px-88px)] relative overflow-hidden pb-24"> {/* Added min-height and padding-bottom */}
          <div className="container mx-auto px-4 h-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 h-full items-center pt-16"> {/* Added padding-top */}
              {/* Left Side Content */}
              <div className="space-y-16">
                {/* Hero Content */}
                <div className="space-y-8">
                  <h1 className="text-5xl md:text-6xl font-bold text-black">
                    PT<span className="text-[#F26430]">+</span>
                  </h1>
                  <p className="text-2xl font-medium text-[#F26430]">
                    Your AI-Powered Personal Trainer
                  </p>
                  <p className="text-lg text-gray-600 max-w-xl">
                    Achieve your fitness goals with smart, adaptive workout plans, real-time form correction, and 
                    AI-driven coaching—designed just for you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto px-6 py-5 text-base rounded-xl hover:scale-105 transition-transform bg-[#F26430] text-white hover:bg-[#F26430]/90"
                      asChild
                    >
                      <Link href="/dashboard">
                        Get Started
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto px-6 py-5 text-base rounded-xl border-2 border-[#F26430] text-[#F26430] bg-white hover:bg-[#F26430]/10 hover:scale-105 transition-transform"
                      asChild
                    >
                      <a href="#features">
                        Learn More
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-black">
                    A New Standard of Fitness,<br />On Your Terms
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        title: "Smart Workout Plans",
                        description: "AI-driven fitness programs designed to match your goals and progress.",
                        icon: "💡"
                      },
                      {
                        title: "Form Analysis",
                        description: "Get real-time feedback on your exercise form to prevent injuries and maximize performance",
                        icon: "📊"
                      },
                      {
                        title: "Progress Tracking",
                        description: "Stay on top of your fitness journey with insightful analytics and milestone tracking",
                        icon: "📈"
                      }
                    ].map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-start space-x-4 bg-white/50 p-6 rounded-xl hover:bg-white/80 transition-all duration-300"
                      >
                        <div className="text-3xl">
                          {feature.icon}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-black">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="relative h-full hidden lg:block">
                <div className="absolute right-[-200px] bottom-[-20px] w-[900px] h-[1100px]"> {/* Adjusted size and position */}
                  <Image
                    src="/hand.png"
                    alt="Fitness Training"
                    fill
                    className="object-contain object-bottom"
                    style={{
                      transform: "translateY(0) rotate(5deg)", /* Removed translateY */
                      filter: "contrast(1.1)"
                    }}
                    priority
                    quality={100}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F26430]/20 rounded-full blur-3xl" />
          </div>
        </section>
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm py-6 border-t border-gray-200 relative z-10"> {/* Reduced footer padding */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl mb-2 text-black">PT<span className="text-[#F26430]">+</span></div>
              <p className="text-gray-600">Your Personal AI Fitness Companion</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-[#F26430] transition-colors">About</a>
              <a href="#" className="text-gray-600 hover:text-[#F26430] transition-colors">Contact</a>
              <a href="#" className="text-gray-600 hover:text-[#F26430] transition-colors">Privacy</a>
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