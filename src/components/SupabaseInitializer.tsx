'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupabaseInitializer({ children }: { children: React.ReactNode }) {
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);

  useEffect(() => {
    const initializeSupabase = async () => {
      await supabase.auth.getSession();
      setSupabaseInitialized(true);
    };
    initializeSupabase();
  }, []);

  if (!supabaseInitialized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}