'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { FaUser, FaEnvelope, FaBuilding, FaIdCard } from 'react-icons/fa';
import Link from 'next/link';
import { withAuth } from '../../components/withAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUser({ ...user, profile: data });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="min-h-screen bg-[#DDEBFF] p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
        {user && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <FaUser className="text-[#71A1FC] text-xl" />
              <div>
                <p className="font-semibold">Full Name</p>
                <p>{user.profile?.fullName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-[#71A1FC] text-xl" />
              <div>
                <p className="font-semibold">Email</p>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FaBuilding className="text-[#71A1FC] text-xl" />
              <div>
                <p className="font-semibold">Company</p>
                <p>{user.profile?.company || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FaIdCard className="text-[#71A1FC] text-xl" />
              <div>
                <p className="font-semibold">Role</p>
                <p>{user.profile?.user_role || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-between">
          <Link href="/" className="px-4 py-2 bg-[#71A1FC] text-white rounded-md hover:bg-opacity-90 transition-colors">
            Back to Dashboard
          </Link>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);