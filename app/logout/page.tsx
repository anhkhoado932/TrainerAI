'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LogoutPage() {
  const router = useRouter()
  
  useEffect(() => {
    // In a real app, you would call your logout API here
    console.log('Logging out user')
    
    // Simulate logout process
    setTimeout(() => {
      // Redirect to home page after logout
      router.push('/')
    }, 1000)
  }, [router])
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Logging out...</CardTitle>
          <CardDescription className="text-center">
            Please wait while we log you out.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full animate-pulse bg-primary/20" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 