"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session, User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'

interface SupabaseContextType {
  supabase: ReturnType<typeof createClientComponentClient<Database>>
  session: Session | null
  user: User | null
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: createClientComponentClient<Database>(),
  session: null,
  user: null,
  isLoading: true,
})

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => createClientComponentClient<Database>())
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const setServerSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    setServerSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <SupabaseContext.Provider value={{ supabase, session, user, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => useContext(SupabaseContext)