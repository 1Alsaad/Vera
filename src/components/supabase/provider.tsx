"use client"

import { createContext, useContext, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import SupabaseInitializer from '../SupabaseInitializer'

const SupabaseContext = createContext<ReturnType<typeof createClientComponentClient<Database>> | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient<Database>())

  return (
    <SupabaseContext.Provider value={supabase}>
      <SupabaseInitializer>{children}</SupabaseInitializer>
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}