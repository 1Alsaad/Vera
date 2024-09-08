'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from './supabase/provider';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { supabase } = useSupabase();

    useEffect(() => {
      const checkUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            router.push('/login');
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error checking user:', error);
          router.push('/login');
        }
      };

      checkUser();
    }, [supabase, router]);

    if (isLoading) {
      return <div>Loading...</div>; // Or any loading component
    }

    return <WrappedComponent {...props} />;
  };
}

// Add this line to export withAuth as default
export default withAuth;