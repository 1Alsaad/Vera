"use client"

import { createContext, useContext, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({
  children,
  supabase,
}: {
  children: React.ReactNode
  supabase: SupabaseClient
}) {
  const [supabaseClient] = useState(() => supabase)

  return (
    <Context.Provider value={{ supabase: supabaseClient }}>
      {children}
    </Context.Provider>
  )
}

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}