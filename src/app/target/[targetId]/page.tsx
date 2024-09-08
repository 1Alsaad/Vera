'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Share, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateMilestoneModal from '@/components/CreateMilestoneModal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useSupabase } from '@/components/supabase/provider';

interface Target {
  id: number;
  target_name: string;
  datapoint: number;
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
  } | null;
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

export default function TargetDetailsPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const params = useParams();
  const targetId = params?.targetId && typeof params.targetId === 'string' ? decodeURIComponent(params.targetId) : '';
  const [target, setTarget] = useState<Target | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false);
  const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTargetDetails();
      fetchOwners();
    }
  }, [currentUser, targetId]);

  async function fetchCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setCurrentUser({ ...user, profile: data });
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error fetching user data');
    }
  }

  const fetchTargetDetails = async () => {
    if (!targetId) {
      setError('No target ID provided');
      return;
    }

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
      setTarget(targetData as Target);

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
        } : undefined,
      }));

      setMilestones(formattedMilestones);

    } catch (error) {
      console.error('Error fetching target details:', error);
      setError('Failed to fetch target details');
    }
  };

  const fetchOwners = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, firstname, lastname');

    if (error) {
      console.error('Error fetching owners:', error);
      return;
    }

    setOwners(data.map(profile => ({
      id: profile.id,
      name: `${profile.firstname} ${profile.lastname}`
    })));
  };

  const chartData = [
    { year: 2020, emissions: 50000 },
    { year: 2030, emissions: 30000 },
    { year: 2040, emissions: 15000 },
    { year: 2050, emissions: 1500 },
  ];

  const handleCreateMilestone = async (milestoneData: any) => {
    try {
      if (!currentUser) {
        throw new Error('User is not authenticated');
      }

      const { data, error } = await supabase
        .from('milestones')
        .insert([{
          ...milestoneData,
          target_id: targetId,
          created_by: currentUser.id
        }])
        .select();

      if (error) throw error;

      console.log('New milestone created:', data);
      fetchTargetDetails();
      setIsCreateMilestoneModalOpen(false);
    } catch (error) {
      console.error('Error creating milestone:', error);
      alert('Failed to create milestone. Please ensure you are logged in and try again.');
    }
  };

  const handleMilestoneClick = (milestoneId: string) => {
    router.push(`/milestone/${milestoneId}`);
  };

  return (
    <div className="p-6 min-h-screen bg-[#EBF8FF]">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Target Details Section */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Target Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="font-semibold">Data Point</CardHeader>
                <CardContent>{target?.data_points?.name}</CardContent>
              </Card>
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="font-semibold">Target Type</CardHeader>
                <CardContent>{target?.target_type}</CardContent>
              </Card>
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="font-semibold">Baseline</CardHeader>
                <CardContent>{target?.baseline_value} ({target?.baseline_year})</CardContent>
              </Card>
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="font-semibold">Target</CardHeader>
                <CardContent>{target?.target_value} ({target?.target_year})</CardContent>
              </Card>
            </div>
          </section>

          {/* Milestones Section */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Milestones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {milestones.map((milestone) => (
                <Card
                  key={milestone.id}
                  className={cn("bg-[#F9FAFB]/[0.56] border-none", "cursor-pointer hover:shadow-lg transition-shadow duration-200")}
                  onClick={() => handleMilestoneClick(milestone.id)}
                >
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

        {/* Right Column: Graph and KPIs */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Progress</h2>
          <Card className="bg-transparent mb-8 border-none shadow-none">
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="emissions" stroke="#8884d8" fillOpacity={1} fill="url(#colorEmissions)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* KPI Section */}
          <h2 className="text-xl font-semibold mb-3">Key Performance Indicators</h2>
          <div className="space-y-4">
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <p className="font-semibold">Current Emissions</p>
                  <p className="text-2xl font-bold">45,000 tCO2e</p>
                </div>
                <div className="flex items-center">
                  <Button variant="outline" size="sm" className="mr-2">Update</Button>
                  <TrendingUp className="text-green-500" size={24} />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <p className="font-semibold">Reduction to Date</p>
                  <p className="text-2xl font-bold">10%</p>
                </div>
                <TrendingDown className="text-red-500" size={24} />
              </CardContent>
            </Card>
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <p className="font-semibold">Projected Reduction</p>
                  <p className="text-2xl font-bold">25%</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </CardContent>
            </Card>
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <p className="font-semibold">Industry Average</p>
                  <p className="text-2xl font-bold">15%</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </CardContent>
            </Card>
          </div>

          <Accordion type="single" collapsible className="space-y-4 mt-8">
            <AccordionItem value="justification" className="bg-transparent">
              <AccordionTrigger>Justification</AccordionTrigger>
              <AccordionContent className="h-[130px] overflow-y-auto">
                {target?.justification}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="stakeholder-involvement" className="bg-transparent">
              <AccordionTrigger>Stakeholder Involvement</AccordionTrigger>
              <AccordionContent className="h-[130px] overflow-y-auto">
                {target?.stakeholders_involvement}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="scientific-evidence" className="bg-transparent">
              <AccordionTrigger>Scientific Evidence</AccordionTrigger>
              <AccordionContent className="h-[130px] overflow-y-auto">
                {target?.scientific_evidence}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Create Milestone Modal */}
      <CreateMilestoneModal
        isOpen={isCreateMilestoneModalOpen}
        onClose={() => setIsCreateMilestoneModalOpen(false)}
        onSubmit={handleCreateMilestone}
        owners={owners}
        targetId={parseInt(targetId, 10)}
      />
    </div>
  );
}
