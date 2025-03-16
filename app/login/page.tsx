'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../src/components/ui/card"
import { Input } from "../../src/components/ui/input"
import { Checkbox } from "../../src/components/ui/checkbox"
import { Alert, AlertDescription } from "../../src/components/ui/alert"
import { Button } from "../../src/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../src/components/ui/form"
import { Icons } from "../../src/components/ui/icons"

// Form schema for validation
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

// Default values for the form
const defaultValues: Partial<LoginFormValues> = {
  email: '',
  password: '',
  rememberMe: false,
}

interface AuthError {
  message: string;
  field?: string;
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const supabase = createClientComponentClient()

  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setAuthError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      
      if (error) {
        throw error
      }

      router.refresh()
      // Check if there's a redirectTo parameter and use it, otherwise go to dashboard
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.push(redirectTo)
    } catch (error) {
      if (error instanceof Error) {
        setAuthError({ message: error.message })
      } else {
        setAuthError({ message: 'An unexpected error occurred. Please try again.' })
      }
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Or{' '}
            <Link href="/register" className="text-primary hover:underline">
              create a new account
            </Link>
          </CardDescription>
        </CardHeader>
        
        {authError && (
          <CardContent>
            <Alert variant="destructive" className="animate-in fade-in-50 border-2 border-destructive">
              <AlertDescription className="font-semibold text-base flex items-center">
                <Icons.warning className="h-5 w-5 mr-2" />
                {authError.message}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        <CardContent className="pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full space-y-2">
                    <FormLabel className="text-base">Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={isLoading}
                        aria-describedby="email-error"
                        className="text-black w-full h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Password</FormLabel>
                      <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        aria-describedby="password-error"
                        className="text-black w-full h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        id="remember-me"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="remember-me" className="text-sm font-medium leading-none cursor-pointer">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-primary hover:underline inline-flex items-center">
              <Icons.arrowLeft className="mr-1 h-4 w-4" />
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26430]"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 