import './globals.css'
import type { Metadata } from 'next'
import { SupabaseProvider } from '@/components/supabase/provider'
import { Toaster } from "@/components/ui/toaster"
import SupabaseInitializer from '@/components/SupabaseInitializer'

// Remove or comment out the next/font import
// import { Inter } from 'next/font/google'

// Remove this const declaration
// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Your App Title',
  description: 'Your app description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseInitializer>
          {children}
          <Toaster />
        </SupabaseInitializer>
      </body>
    </html>
  )
}
