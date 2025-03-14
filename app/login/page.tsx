'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../src/components/ui/card"
import { Input } from "../../src/components/ui/input"
import { Label } from "../../src/components/ui/label"
import { Checkbox } from "../../src/components/ui/checkbox"
import { Separator } from "../../src/components/ui/separator"
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

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(null)

  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setAuthError(null)
    
    try {
      // In a real app, you would call your authentication API here
      console.log('Login attempt with:', { email: data.email, password: data.password })
      
      // Simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to dashboard after successful login
      router.push('/dashboard')
    } catch (error) {
      // Handle different types of errors
      if (error instanceof Error) {
        setAuthError({ message: error.message })
      } else {
        setAuthError({ message: 'An unexpected error occurred. Please try again.' })
      }
      setIsLoading(false)
    }
  }
  
  // Social login handlers
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setAuthError(null)
    
    try {
      // Implement Google OAuth login
      console.log('Google login initiated')
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/dashboard')
    } catch (error) {
      setAuthError({ message: 'Failed to login with Google. Please try again.' })
      setIsLoading(false)
    }
  }
  
  const handleGitHubLogin = async () => {
    setIsLoading(true)
    setAuthError(null)
    
    try {
      // Implement GitHub OAuth login
      console.log('GitHub login initiated')
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/dashboard')
    } catch (error) {
      setAuthError({ message: 'Failed to login with GitHub. Please try again.' })
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
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
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertDescription>{authError.message}</AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={isLoading}
                        aria-describedby="email-error"
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
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
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
          <div className="relative my-4 w-full">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2"
            >
              <Icons.google className="h-4 w-4" />
              Google
            </Button>

            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={handleGitHubLogin}
              className="flex items-center justify-center gap-2"
            >
              <Icons.gitHub className="h-4 w-4" />
              GitHub
            </Button>
          </div>
          
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