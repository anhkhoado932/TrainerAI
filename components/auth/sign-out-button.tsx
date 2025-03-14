'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

interface SignOutButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
}

export function SignOutButton({ variant = 'default' }: SignOutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-gray-600 hover:text-black transition-colors"
    >
      {isLoading ? (
        <>
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin text-gray-600" />
          <span className="text-gray-600">Signing out...</span>
        </>
      ) : (
        'Sign out'
      )}
    </Button>
  )
} 