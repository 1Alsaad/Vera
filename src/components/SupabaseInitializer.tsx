'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SupabaseProvider } from './supabase/provider'

export default function SupabaseInitializer({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClientComponentClient()

  return <SupabaseProvider supabase={supabase}>{children}</SupabaseProvider>
}