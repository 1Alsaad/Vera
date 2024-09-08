'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/supabase/provider';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { session, isLoading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login');
    }
  }, [session, isLoading, router]);

  const topics = [
    'Climate change',
    'Water & marine resources',
    'Biodiversity & ecosystems',
    'Pollution',
    'Circular economy',
    'Own workforce',
    'Workers in the value chain',
    'Affected communities',
    'Consumers/end-users',
    'Business conduct',
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to your Dashboard!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>{topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/topic/${encodeURIComponent(topic)}`} passHref>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}