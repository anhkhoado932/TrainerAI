'use client'

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'

export function LoginButton() {
  const supabase = useSupabaseClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <Button onClick={handleSignIn}>
      Sign in with GitHub
    </Button>
  )
} 