'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface Survey {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('profiles')
      .select('company')
      .eq('id', user.id)
      .single();

    if (!userData?.company) return;

    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('company', userData.company)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching surveys:', error);
    } else {
      setSurveys(data || []);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Surveys</h1>
        <Link href="/surveys/create">
          <Button>Create New Survey</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <Card key={survey.id}>
            <CardHeader>
              <CardTitle>{survey.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">{survey.description}</p>
              <p className="text-xs text-gray-400">Created: {new Date(survey.created_at).toLocaleDateString()}</p>
              <Link href={`/surveys/${survey.id}`}>
                <Button variant="outline" className="mt-2">View Survey</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {surveys.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No surveys found. Create your first survey!</p>
      )}
    </div>
  );
}