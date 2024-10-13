'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Edit, Trash2, Share2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { Badge } from '@/components/ui/badge';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from "@/hooks/use-toast";

type Target = Database['public']['Tables']['targets']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];

interface TargetDetailsClientProps {
  target: Target;
  milestones: Milestone[];
}

const TargetDetailsClient: React.FC<TargetDetailsClientProps> = ({ target, milestones }) => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.user_role === 'Administrator');
      }
    };

    checkAdminStatus();
  }, [supabase]);

  const calculateProgress = () => {
    const completedMilestones = milestones.filter(milestone => milestone.status === 'Completed').length;
    return (completedMilestones / milestones.length) * 100;
  };

  return (
    <div className="flex h-screen bg-[#EBF8FF]">
      <div className="flex-grow overflow-auto p-6 md:p-10">
        <Button className="mb-6 bg-[#BBCDEF] text-[#1E293B] hover:bg-[#BBCDEF]/90 rounded-full px-4 h-[35px]" onClick={() => router.back()}>
          <ChevronLeft className="mr-2" size={20} /> Back
        </Button>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2">{target.target_name}</h1>
              <p className="text-base md:text-lg text-gray-600">{target.justification}</p>
            </div>
            <div className="space-y-2 md:space-y-0 md:space-x-3 flex flex-col md:flex-row">
              <Button className="bg-[#020B19] text-white hover:bg-[#020B19]/90 rounded-full w-[120px] h-[35px] flex justify-center items-center">
                <Edit size={20} className="mr-2" /> Edit
              </Button>
              {isAdmin && (
                <Button className="bg-[#BBCDEF] text-[#1E293B] hover:bg-[#BBCDEF]/90 rounded-full w-[100px] h-[35px] flex justify-center items-center">
                  <Trash2 size={20} className="mr-2" /> Delete
                </Button>
              )}
              <Button className="bg-[#BBCDEF] text-[#1E293B] hover:bg-[#BBCDEF]/90 rounded-full w-[100px] h-[35px] flex justify-center items-center">
                <Share2 size={20} className="mr-2" /> Share
              </Button>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">{target.target_type}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { title: 'Baseline Value', value: target.baseline_value },
            { title: 'Target Value', value: target.target_value },
            { title: 'Current Value', value: target.current_value || 'N/A' },
            { title: 'Target Year', value: target.target_year },
          ].map((item, index) => (
            <Card key={index} className="bg-[#B5C1D0]/[0.56] border border-gray-300">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-medium text-[#1E293B]">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl md:text-3xl font-bold text-[#1E293B]">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8 bg-[#B5C1D0]/[0.56] border border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold text-[#1E293B]">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={calculateProgress()} 
              className="mb-4 h-5 bg-gray-200 [&>div]:bg-[#020B19] [&>div]:rounded-full" 
            />
            <p className="text-base md:text-lg text-[#1E293B]">{calculateProgress().toFixed(2)}% Complete</p>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#1E293B]">Milestones</h2>
          {milestones.map(milestone => (
            <Card key={milestone.id} className="bg-[#B5C1D0]/[0.56] border border-gray-300 mb-4">
              <CardContent className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg md:text-xl font-medium text-[#1E293B]">{milestone.notes}</h3>
                  <Badge variant="secondary" className="text-sm">{milestone.status}</Badge>
                </div>
                <p className="text-base md:text-lg text-gray-600 mb-4">{milestone.impact_on_target}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base text-gray-600">Due: {new Date(milestone.period_end).toLocaleDateString()}</span>
                  <Button 
                    className="bg-transparent hover:bg-transparent text-[#020B19] border border-[#020B19] rounded-full px-4 h-[30px] flex items-center text-sm"
                    onClick={() => {/* Handle milestone completion */}}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          className="mb-8 bg-[#020B19] text-white hover:bg-[#020B19]/90 rounded-full px-4 h-[35px]"
          onClick={() => {/* Handle adding new milestone */}}
        >
          <Plus size={20} className="mr-2" /> Add Milestone
        </Button>
      </div>
    </div>
  );
};

export default TargetDetailsClient;