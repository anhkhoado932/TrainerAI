"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { useEffect, useRef, useState } from "react"

interface DashboardContentProps {
  hasAssessment: boolean
  hasWorkoutPlan: boolean
}

export function DashboardContent({ hasAssessment, hasWorkoutPlan }: DashboardContentProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardGlows, setCardGlows] = useState<{ x: number, y: number, active: boolean }[]>([
    { x: 0, y: 0, active: false },
    { x: 0, y: 0, active: false },
    { x: 0, y: 0, active: false }
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });

        // Update each card's glow position
        const newCardGlows = [...cardGlows];
        cardRefs.current.forEach((cardRef, index) => {
          if (cardRef) {
            const cardRect = cardRef.getBoundingClientRect();
            const containerRect = containerRef.current!.getBoundingClientRect();
            
            // Calculate relative position within the card
            const relativeX = e.clientX - cardRect.left;
            const relativeY = e.clientY - cardRect.top;
            
            // Check if mouse is over this card
            const isActive = 
              relativeX >= 0 && 
              relativeX <= cardRect.width && 
              relativeY >= 0 && 
              relativeY <= cardRect.height;
            
            newCardGlows[index] = {
              x: relativeX,
              y: relativeY,
              active: isActive
            };
          }
        });
        setCardGlows(newCardGlows);
      }
    };

    const handleMouseLeave = () => {
      setCardGlows(cardGlows.map(glow => ({ ...glow, active: false })));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [cardGlows]);

  // Function to set card refs
  const setCardRef = (el: HTMLDivElement | null, index: number) => {
    cardRefs.current[index] = el;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-black flex items-center gap-1">
            <Icons.dumbbell className="h-6 w-6 text-[#F26430]" />
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
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-black sm:text-5xl">
              Welcome to Your Fitness Journey
            </h1>
            <p className="text-xl text-gray-600">
              Let's create your personalized fitness plan with our AI-powered assessment
            </p>
          </div>

          <div 
            ref={containerRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
          >
            {/* Global glow background */}
            <div 
              className="absolute pointer-events-none" 
              style={{
                background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.07), transparent 80%)`,
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                zIndex: 0,
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: 0.8,
                filter: 'blur(40px)'
              }}
            />

            <Card 
              ref={(el) => setCardRef(el, 0)}
              className="bg-white border-gray-200 hover:shadow-lg hover:shadow-[#F26430]/10 transition-all relative overflow-hidden group flex flex-col h-[300px]"
            >
              {/* Card-specific glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" 
                style={{
                  background: `radial-gradient(400px circle at ${cardGlows[0].x}px ${cardGlows[0].y}px, rgba(59, 130, 246, 0.3), transparent 40%)`,
                  opacity: cardGlows[0].active ? 1 : 0.3,
                  filter: 'blur(20px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              />
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-500 animate-pulse-slow" />
              <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500 animate-pulse-slower" />
              
              <div className="p-6 relative flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.fileText className="h-5 w-5 text-[#F26430]" />
                    <h2 className="text-lg font-semibold text-black">Assessment</h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {hasAssessment 
                      ? "Your fitness assessment has been completed" 
                      : "Complete a quick assessment to get started"}
                  </p>
                </div>
                
                <div className="mt-auto pt-4">
                  <Button 
                    className="w-full bg-[#F26430] hover:bg-[#F26430]/90 text-white relative overflow-hidden group/btn py-1.5 px-6 rounded-lg"
                    asChild
                  >
                    <Link href="/assessment" className="flex items-center justify-center gap-2">
                      <span className="relative z-10 text-xs">
                        {hasAssessment ? "View Assessment" : "Start Assessment"}
                      </span>
                      <Icons.arrowRight className="h-3 w-3 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>

            <Card 
              ref={(el) => setCardRef(el, 1)}
              className="bg-white border-gray-200 hover:shadow-lg hover:shadow-[#F26430]/10 transition-all relative overflow-hidden group flex flex-col h-[300px]"
            >
              {/* Card-specific glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" 
                style={{
                  background: `radial-gradient(400px circle at ${cardGlows[1].x}px ${cardGlows[1].y}px, rgba(168, 85, 247, 0.3), transparent 40%)`,
                  opacity: cardGlows[1].active ? 1 : 0.3,
                  filter: 'blur(20px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              />
              <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-500 animate-pulse-slow" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors duration-500 animate-pulse-slower" />
              
              <div className="p-6 relative flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.dumbbell className="h-5 w-5 text-[#F26430]" />
                    <h2 className="text-lg font-semibold text-black">Workouts</h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {hasWorkoutPlan 
                      ? "View your personalized workout plans" 
                      : "Complete assessment to unlock workout plans"}
                  </p>
                </div>
                
                <div className="mt-auto pt-4">
                  {hasWorkoutPlan ? (
                    <Button 
                      className="w-full bg-[#F26430] hover:bg-[#F26430]/90 text-white relative overflow-hidden group/btn py-1.5 px-6 rounded-lg"
                      asChild
                    >
                      <Link href="/workout" className="flex items-center justify-center gap-2">
                        <span className="relative z-10 text-xs">View Workouts</span>
                        <Icons.arrowRight className="h-3 w-3 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center h-[24px] text-center text-gray-500">
                      {hasAssessment ? "Generating your plan..." : "Coming Soon"}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card 
              ref={(el) => setCardRef(el, 2)}
              className="bg-white border-gray-200 hover:shadow-lg hover:shadow-[#F26430]/10 transition-all relative overflow-hidden group flex flex-col h-[300px]"
            >
              {/* Card-specific glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" 
                style={{
                  background: `radial-gradient(400px circle at ${cardGlows[2].x}px ${cardGlows[2].y}px, rgba(16, 185, 129, 0.3), transparent 40%)`,
                  opacity: cardGlows[2].active ? 1 : 0.3,
                  filter: 'blur(20px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              />
              <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors duration-500 animate-pulse-slow" />
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-colors duration-500 animate-pulse-slower" />
              
              <div className="p-6 relative flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.chart className="h-5 w-5 text-[#F26430]" />
                    <h2 className="text-lg font-semibold text-black">Progress</h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Track your fitness journey progress
                  </p>
                </div>
                
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-center h-[48px] text-center text-gray-500">
                    Coming Soon
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-[#F26430]/5 border border-[#F26430]/10 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600">
              Complete your assessment to unlock personalized workout plans and progress tracking
            </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.9; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
} 