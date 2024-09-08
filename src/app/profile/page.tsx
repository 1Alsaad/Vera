'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/supabase/provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  avatar_url?: string;
};

export default function ProfilePage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [avatar_url, setAvatarUrl] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [has_avatar, setHasAvatar] = useState<boolean>(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFirstname(data.firstname || '');
        setLastname(data.lastname || '');
        setEmail(data.email);
        setCompany(data.company || '');
        setHasAvatar(data.has_avatar);
        // Note: avatar_url is not in the profiles table, it might be in the user object
        setAvatarUrl(user.user_metadata?.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error loading user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

      const updates: Partial<Profile> = {
        id: user.id,
        firstname,
        lastname,
        email,
        company,
        has_avatar,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating the profile:', error);
      alert('Error updating the profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const generateAndUploadAvatar = async () => {
    if (!firstname || !lastname || !company) {
      alert('First name, last name, and company are required to generate an avatar.');
      return;
    }

    const getRandomColor = () => Math.floor(Math.random()*16777215).toString(16);
    const avatarURL = `https://api.dicebear.com/9.x/initials/svg?seed=${firstname}${lastname}&size=128&backgroundColor=${getRandomColor()}&backgroundType=gradientLinear&backgroundRotation=0,360&textColor=ffffff&radius=50`;

    try {
      const response = await fetch(avatarURL);
      if (!response.ok) throw new Error('Failed to fetch avatar');
      const blob = await response.blob();

      const filePath = `avatars/${firstname}_${lastname}.svg`;
      const { data, error } = await supabase.storage
        .from(company)
        .upload(filePath, blob, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(company)
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setHasAvatar(true);
      await updateProfile({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
      alert('Avatar generated and uploaded successfully!');
    } catch (error) {
      console.error('Error generating or uploading avatar:', error);
      alert('Failed to generate or upload avatar. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={avatar_url || undefined} alt="Profile" />
              <AvatarFallback>{firstname.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={generateAndUploadAvatar}>
              Generate Avatar
            </Button>
          </div>
          <form onSubmit={updateProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Loading ...' : 'Update'}
              </Button>
              <Button type="button" variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
