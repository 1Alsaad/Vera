'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session);
        if (session?.user) {
          console.log('User authenticated:', session.user);
          setUser(session.user);
        } else {
          console.log('No authenticated user, redirecting to login');
          router.push('/login');
        }
      }
      checkAuth();
    }, [router]);

    if (!user) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

// Add this line to export withAuth as default
export default withAuth;