import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from './supabase/provider';

export function withAuth<T extends JSX.IntrinsicAttributes>(WrappedComponent: React.ComponentType<T & { user: any }>) {
  return function WithAuth(props: T) {
    const { supabase, session } = useSupabase();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
      const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
        } else {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            setUser(user);
          } else {
            setUser({ ...user, profile });
          }
          setIsLoading(false);
        }
      };

      checkUser();
    }, [supabase, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

// Add this line to export withAuth as default
export default withAuth;