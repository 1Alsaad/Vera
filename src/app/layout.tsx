import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/toaster"
import SupabaseInitializer from '@/components/SupabaseInitializer'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Remove or comment out the next/font import
// import { Inter } from 'next/font/google'

// Remove this const declaration
// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vera',
  description: '',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
