'use client'

import { useSession, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export function Profile() {
  const session = useSession()
  const user = useUser()
  const supabase = useSupabaseClient()

  if (!session) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome {user?.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
    </div>
  )
} 