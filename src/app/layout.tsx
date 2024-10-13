import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/toaster"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ThemeProvider } from '../contexts/ThemeContext'
import { SupabaseProvider } from '@/components/supabase/provider'

export const metadata: Metadata = {
  title: 'Vera',
  description: '',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <SupabaseProvider>{children}</SupabaseProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
