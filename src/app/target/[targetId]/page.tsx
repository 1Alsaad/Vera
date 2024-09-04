'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Share, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { withAuth } from '../../../components/withAuth';
import CreateMilestoneModal from '@/components/CreateMilestoneModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Target {
  id: string;
  target_name: string;
  datapoint: string;
  target_type: string;
  baseline_year: number;
  baseline_value: string;
  target_year: number;
  target_value: string;
  owner: string;
  justification: string;
  scientific_evidence: string;
  stakeholders_involvement: string;
  data_points: {
    name: string;
  };
  company: string;
}

interface Milestone {
  id: string;
  period_start: string | null;
  period_end: string;
  owner: string;
  required: boolean;
  status: 'Planned' | 'In Progress' | 'Completed';
  impact_on_target: string | null;
  notes: string | null;
  profiles?: {
    firstname: string;
    lastname: string;
  };
}

function TargetDetailsPage({ userId }: { userId: string }) {
  const router = useRouter();
  const params = useParams();
  const targetId = typeof params.targetId === 'string' ? decodeURIComponent(params.targetId) : '';
  const [target, setTarget] = useState<Target | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false);

  const fetchTargetDetails = async () => {
    try {
      const { data: targetData, error: targetError } = await supabase
        .from('targets')
        .select(`
          *,
          data_points (name)
        `)
        .eq('id', targetId)
        .single();

      if (targetError) throw targetError;
      setTarget(targetData);

      const { data: milestoneData, error: milestoneError } = await supabase
        .from('milestones')
        .select(`
          id,
          period_start,
          period_end,
          owner,
          required,
          status,
          impact_on_target,
          notes,
          profiles:owner (firstname, lastname)
        `)
        .eq('target_id', targetId)
        .order('period_end', { ascending: true });

      if (milestoneError) throw milestoneError;

      const formattedMilestones = milestoneData.map((milestone: any) => ({
        ...milestone,
        profiles: milestone.profiles ? {
          firstname: milestone.profiles.firstname,
          lastname: milestone.profiles.lastname,
        } : null,
      }));

      setMilestones(formattedMilestones);

    } catch (error) {
      console.error('Error fetching target details:', error);
      setError('Failed to fetch target details');
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchTargetDetails();
    }
  }, [targetId]);

  const chartData = [
    { year: 2020, emissions: 50000 },
    { year: 2030, emissions: 30000 },
    { year: 2040, emissions: 15000 },
    { year: 2050, emissions: 1500 },
  ];

  const handleCreateMilestone = async (milestoneData: any) => {
    try {
      console.log('Milestone data to be inserted:', milestoneData);

      const { data, error } = await supabase
        .from('milestones')
        .insert([milestoneData])
        .select();

      if (error) throw error;

      console.log('New milestone created:', data);
      // Refresh the milestones list
      fetchTargetDetails();
      setIsCreateMilestoneModalOpen(false);
    } catch (error) {
      console.error('Error creating milestone:', error);
      // Handle error (show message to user, etc.)
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!target) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" className="flex items-center" asChild>
            <Link href="/topic/Targets & actions">
              <ArrowLeft className="mr-2" size={16} /> Back
            </Link>
          </Button>
          <div className="space-x-2">
            <Button variant="outline" size="sm"><Edit size={16} className="mr-1" /> Edit</Button>
            <Button variant="outline" size="sm"><Trash2 size={16} className="mr-1" /> Delete</Button>
            <Button variant="outline" size="sm"><Share size={16} className="mr-1" /> Share</Button>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{target?.target_name || 'Reduce Scope 1 GHG emissions'}</h1>
          <p className="text-sm text-gray-600 mt-1">{target?.data_points?.name || 'Gross Scope 1 greenhouse gas emissions'}</p>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">In Progress</span>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Target Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="font-semibold">Data Point</CardHeader>
                <CardContent>{target.data_points?.name}</CardContent>
              </Card>
              <Card>
                <CardHeader className="font-semibold">Target Type</CardHeader>
                <CardContent>{target.target_type}</CardContent>
              </Card>
              <Card>
                <CardHeader className="font-semibold">Baseline</CardHeader>
                <CardContent>{target.baseline_value} ({target.baseline_year})</CardContent>
              </Card>
              <Card>
                <CardHeader className="font-semibold">Target</CardHeader>
                <CardContent>{target.target_value} ({target.target_year})</CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Milestones</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {milestones.slice(0, 2).map((milestone) => (
                <Card key={milestone.id}>
                  <CardHeader className="font-semibold">
                    {milestone.period_start ? `${milestone.period_start} - ${milestone.period_end}` : milestone.period_end}
                    {milestone.required && ' (required)'}
                  </CardHeader>
                  <CardContent>
                    <p>Owner: {milestone.profiles ? `${milestone.profiles.firstname} ${milestone.profiles.lastname}` : 'Not assigned'}</p>
                    <p>Due: {milestone.period_end}</p>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                      milestone.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {milestone.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsCreateMilestoneModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Add Milestone
            </Button>
          </section>
        </div>

        <div>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Progress Chart</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="emissions" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Key Performance Indicators</h2>
            <Card className="mb-4">
              <CardHeader className="font-semibold">Current Emissions</CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">850 tons</span>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
                <span className="text-green-500">▼ 15%</span>
              </CardContent>
            </Card>
            <Card className="mb-4">
              <CardHeader className="font-semibold">Reduction to Date</CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">15%</span>
                <span className="text-green-500 ml-2">▲ 15%</span>
              </CardContent>
            </Card>
            <Card className="mb-4">
              <CardHeader className="font-semibold">Projected Reduction</CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">45%</span>
                <span className="text-green-500 ml-2">▲ 5%</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="font-semibold">Industry Average</CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">12%</span>
                <span className="text-green-500 ml-2">▲ 3%</span>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <CreateMilestoneModal
        isOpen={isCreateMilestoneModalOpen}
        onClose={() => setIsCreateMilestoneModalOpen(false)}
        onSave={handleCreateMilestone}
        targetId={targetId}
        companyId={target?.company || ''}
        currentUserId={userId}
      />
    </div>
  );
}

export default withAuth(TargetDetailsPage);