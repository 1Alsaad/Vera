import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('Initial user check result:', user ? 'User exists' : 'No user', error ? `Error: ${error.message}` : 'No error');

        if (error) throw error;

        setIsAuthenticated(!!user);
        setUser(user);
        console.log('Initial authentication state:', !!user);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'null');
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    checkAuth();

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  return { isLoading, isAuthenticated, user };
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
}
