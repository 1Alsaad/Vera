'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import { withAuth } from '../../../components/withAuth';
import { FaHome, FaBell, FaUser, FaRobot, FaPaperclip, FaComments } from 'react-icons/fa';
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ChatSidebar from '../../../components/ChatSidebar';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Breadcrumb from '@/components/Breadcrumb';

interface Task {
  id: string;
  datapoint: string;
  // Add other relevant fields
}

interface DataPoint {
  id: bigint;
  esrs: string | null;
  dr: string | null;
  paragraph: string | null;
  related_ar: string | null;
  name: string | null;
  data_type: string | null;
}

interface CombinedTask extends Task {
  dataPointDetails: DataPoint;
}

function DisclosureDetailsPage() {
  const router = useRouter();
  const { disclosureId } = useParams();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [combinedTasks, setCombinedTasks] = useState<CombinedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [disclosureTitle, setDisclosureTitle] = useState<string>('');
  const [disclosureReference, setDisclosureReference] = useState<string>('');

  const fetchDisclosureReference = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('disclosures')
        .select('reference')
        .eq('id', disclosureId)
        .single();

      if (error) throw error;
      setDisclosureReference(data.reference);
    } catch (error) {
      console.error('Error fetching disclosure reference:', error);
    }
  }, [disclosureId]);

  const fetchTasksAndDataPoints = useCallback(async () => {
    try {
      let tasks: Task[] = [];

      if (currentUser.profile.user_role === 'Administrator') {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('company', currentUser.profile.company)
          .eq('disclosure', disclosureId);

        if (error) throw error;
        tasks = data;
      } else {
        const { data: taskOwners, error: taskOwnersError } = await supabase
          .from('task_owners')
          .select('task_id')
          .eq('user_id', currentUser.id)
          .eq('company', currentUser.profile.company);

        if (taskOwnersError) throw taskOwnersError;

        const taskIds = taskOwners.map(to => to.task_id);
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .in('id', taskIds)
          .eq('disclosure', disclosureId);

        if (error) throw error;
        tasks = data;
      }

      const dataPointIds = tasks.map(task => task.datapoint);
      const { data: dataPoints, error: dataPointsError } = await supabase
        .from('data_points')
        .select('*')
        .in('id', dataPointIds);

      if (dataPointsError) throw dataPointsError;

      const combined = tasks.map(task => ({
        ...task,
        dataPointDetails: dataPoints.find(dp => dp.id === task.datapoint) || null
      }));

      setCombinedTasks(combined);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [currentUser, disclosureId]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchCurrentUser();
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (currentUser && disclosureId) {
      fetchTasksAndDataPoints();
      fetchDisclosureReference();
    }
  }, [currentUser, disclosureId, fetchTasksAndDataPoints, fetchDisclosureReference]);

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setError('Error fetching user profile');
      } else if (data) {
        setCurrentUser({ ...user, profile: data });
      }
    }
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Topics', href: '/topic' },
    { label: topic || 'Topic', href: `/topic/${encodeURIComponent(topic || '')}` },
    { label: disclosureReference || 'Disclosure', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-[#DDEBFF] dark:bg-gray-900 text-[#1F2937] dark:text-gray-100 text-base font-poppins flex flex-col">
      <div className="p-8 pl-12 flex justify-between items-center">
        <Breadcrumb items={breadcrumbItems} />
        <ModeToggle />
      </div>

      <div className="flex-grow flex overflow-hidden pl-12"> {/* Added left padding */}
        <div className="w-[70%] pr-4 overflow-y-auto">
          {error && <p className="text-red-500 mb-4 max-w-[450px]">{error}</p>}

          {combinedTasks.map(task => (
            <div key={task.id} className="mb-10">
              <div className="rounded-lg overflow-hidden transition-all duration-300 bg-transparent">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[1.25rem] font-semibold text-[#1F2937] flex-grow pr-4">
                      {task.dataPointDetails?.name}
                    </h2>
                    <div className="flex flex-col items-end">
                      <div className="flex space-x-2 mb-2">
                        <span className="px-3 py-1 bg-transparent border border-[#71A1FC] text-[#1F2937] rounded-full text-xs font-light">
                          {task.dataPointDetails?.paragraph}
                        </span>
                        <span className="px-3 py-1 bg-transparent border border-[#71A1FC] text-[#1F2937] rounded-full text-xs font-light">
                          {task.dataPointDetails?.data_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-[345px] h-[40px] px-4 bg-transparent border border-[#71A1FC] rounded-full">
                        <div className="flex items-center">
                          <Switch id={`done-${task.id}`} />
                          <label htmlFor={`done-${task.id}`} className="text-sm font-light text-[#1F2937] ml-2">Done</label>
                        </div>
                        <div className="flex items-center space-x-6">
                          <FaRobot className="text-[#1F2937] cursor-pointer" title="AI Assistant" />
                          <FaPaperclip className="text-[#1F2937] cursor-pointer" title="Attach File" />
                          <FaComments className="text-[#1F2937] cursor-pointer" title="Chat" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Textarea
                      id={`datapoint-${task.id}`}
                      placeholder="Enter data point value"
                      className="min-h-[200px] bg-transparent border border-[#71A1FC] w-full text-[#1F2937] font-light"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {combinedTasks.length === 0 && (
            <p className="text-[#1F2937] max-w-[450px]">No data points found for this disclosure.</p>
          )}
        </div>
        <div className="w-[30%] fixed right-0 top-0 bottom-0 p-4 overflow-y-auto bg-transparent">
          <div 
            className="h-full bg-transparent rounded-lg overflow-hidden"
            style={{ boxShadow: '0 0 5px 2px rgba(0, 0, 0, 0.1)' }}
          >
            <ChatSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DisclosureDetailsPage);