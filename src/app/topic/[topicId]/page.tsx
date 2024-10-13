'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/components/supabase/provider';
import Link from 'next/link';
import { ChevronLeft, Plus, Edit, Trash2, Share2 } from 'lucide-react';
import { withAuth } from '../../../components/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from "@/components/mode-toggle";
import AssignOwnerModal from '@/components/AssignOwnerModal';
import CreateTargetModal from '@/components/CreateTargetModal';

// Add these type definitions
interface Disclosure {
  id: number;
  description: string | null;
  metric_type: string | null;
  reference: string | null;
  topic: string | null;
  tasks: { id: number }[];
  task_owners: { user_id: string }[];
  ownerId?: string | null;
  status?: string;
}

interface Target {
  id: number;
  target_name: string;
  status?: string;
}

interface GroupedDisclosures {
  [key: string]: (Disclosure | Target)[];
}

export default withAuth(TopicPage);

function TopicPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const params = useParams();
  const topicId = typeof params?.topicId === 'string' ? decodeURIComponent(params.topicId) : '';
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [groupedDisclosures, setGroupedDisclosures] = useState<GroupedDisclosures>({
    Strategy: [],
    'Impacts, risks and opportunity management': [],
    Metrics: [],
    'Targets & actions': [],
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('Strategy');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDisclosureId, setSelectedDisclosureId] = useState<string | null>(null);
  const [currentOwnerId, setCurrentOwnerId] = useState<string | null>(null);
  const [isCreateTargetModalOpen, setIsCreateTargetModalOpen] = useState(false);

  const sidebarSections = [
    'Strategy',
    'Impacts, risks and opportunity management',
    'Metrics',
    'Targets & actions'
  ];

  const filteredSections = sidebarSections.filter(section =>
    section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
        .schema('user_management')
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

  useEffect(() => {
    if (currentUser) {
      fetchDisclosuresAndTargets();
    }
  }, [currentUser, topicId, selectedSection]);

  async function fetchDisclosuresAndTargets() {
    if (!currentUser?.profile?.company || !currentUser?.profile?.id || !topicId) {
      setError('User information or selected topic is incomplete.');
      return;
    }

    const { company, id: userId, user_role: userRole } = currentUser.profile;

    try {
      let disclosuresQuery = supabase
        .schema('esrs')
        .from('disclosures')
        .select('*')
        .eq('topic', topicId)
        .order('reference', { ascending: true });

      if (userRole === 'Administrator') {
        const { data: materialDisclosures, error: materialError } = await supabase
          .schema('double_materiality_assessment')
          .from('disclosure_materiality_assessments')
          .select('reference')
          .eq('company', company)
          .eq('materiality', 'Material')
          .eq('topic', topicId);

        if (materialError) throw materialError;

        const materialReferences = materialDisclosures.map(d => d.reference);
        disclosuresQuery = disclosuresQuery.in('reference', materialReferences);
      } else {
        disclosuresQuery = disclosuresQuery
          .eq('tasks.company', company)
          .eq('task_owners.user_id', userId);
      }

      const { data: disclosures, error } = await disclosuresQuery;

      if (error) throw error;

      const grouped: GroupedDisclosures = {
        Strategy: [],
        'Impacts, risks and opportunity management': [],
        Metrics: [],
        'Targets & actions': [],
      };

      disclosures.forEach(disclosure => {
        // Check if task_owners is defined and has at least one element
        disclosure.ownerId = (disclosure.task_owners && disclosure.task_owners.length > 0) 
          ? disclosure.task_owners[0].user_id 
          : null;

        delete disclosure.tasks;
        delete disclosure.task_owners;

        switch (disclosure.metric_type) {
          case 'Strategy':
            grouped.Strategy.push(disclosure);
            break;
          case 'IROm':
            grouped['Impacts, risks and opportunity management'].push(disclosure);
            break;
          case 'Metrics':
            grouped.Metrics.push(disclosure);
            break;
          case 'Governance':
          case 'BasisForPreparation':
          case 'MDR':
            grouped['Targets & actions'].push(disclosure);
            break;
          default:
            grouped['Targets & actions'].push(disclosure);
        }
      });

      // Fetch targets
      const { data: targets, error: targetsError } = await supabase
      .schema('target_tracking')
        .from('targets')
        .select('*')
        .eq('topic', topicId)
        .eq('company', company);

      if (targetsError) throw targetsError;

      grouped['Targets & actions'] = [
        ...grouped['Targets & actions'],
        ...targets
      ];

      setGroupedDisclosures(grouped);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }

  const handleAssignOwner = (disclosureId: string, currentOwnerId: string | null) => {
    if (currentUser?.profile?.user_role === 'Administrator') {
      setSelectedDisclosureId(disclosureId);
      setCurrentOwnerId(currentOwnerId);
      setIsModalOpen(true);
    }
  };

  const handleAssignOwnerConfirm = async (userId: string) => {
    if (selectedDisclosureId) {
      try {
        const { error } = await supabase
          .from('task_owners')
          .upsert({ 
            task_id: parseInt(selectedDisclosureId, 10), // Convert string to number
            user_id: userId,
            company: currentUser?.profile?.company,
            datapoint_id: 0, // Add a default value or fetch the correct value
            disclosure_id: 0 // Add a default value or fetch the correct value
          });

        if (error) throw error;
        
        // Refresh the disclosures or update the UI as needed
        fetchDisclosuresAndTargets();
      } catch (error) {
        console.error('Error assigning owner:', error);
        setError('Failed to assign owner');
      }
    }
    setIsModalOpen(false);
  };

  const handleRemoveOwner = async (userId: string) => {
    if (selectedDisclosureId) {
      try {
        const { error } = await supabase
          .from('task_owners')
          .delete()
          .match({ task_id: selectedDisclosureId, user_id: userId });

        if (error) throw error;
        
        // Refresh the disclosures or update the UI as needed
        fetchDisclosuresAndTargets();
      } catch (error) {
        console.error('Error removing owner:', error);
        setError('Failed to remove owner');
      }
    }
    setIsModalOpen(false);
  };

  const handleCreateTarget = async (targetData: any) => {
    console.log('New target created:', targetData);
    // Refresh the targets list
    await fetchDisclosuresAndTargets();
    setIsCreateTargetModalOpen(false);
  };

  function isTarget(item: Disclosure | Target): item is Target {
    return 'target_name' in item;
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex h-screen bg-custom-bg !important">
      <div className="flex-grow overflow-auto p-6 md:p-10">
        <Button className="mb-6 bg-custom-button text-custom-button-text hover:bg-custom-button/90 rounded-full px-4 h-[35px]" onClick={() => router.back()}>
          <ChevronLeft className="mr-2" size={20} /> Back
        </Button>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-custom-text !important mb-2">{topicId}</h1>
              <p className="text-base md:text-lg text-gray-600">Topic Overview</p>
            </div>
            <div className="space-y-2 md:space-y-0 md:space-x-3 flex flex-col md:flex-row">
              <ModeToggle />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {sidebarSections.map((section, index) => (
            <Button
              key={index}
              className={`h-auto p-4 ${selectedSection === section ? 'bg-custom-accent text-white' : 'bg-custom-card text-custom-text'} !important border-none hover:bg-custom-accent/90 hover:text-white transition-colors`}
              onClick={() => setSelectedSection(section)}
            >
              <div className="text-left w-full">
                <h3 className="text-base md:text-lg font-medium mb-2">{section}</h3>
                <p className="text-2xl md:text-3xl font-bold">
                  {groupedDisclosures[section]?.length || 0}
                </p>
              </div>
            </Button>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-custom-text !important">{selectedSection}</h2>
          <div className="space-y-4">
            {(groupedDisclosures[selectedSection as keyof GroupedDisclosures] || []).map((item: Disclosure | Target) => (
              <Link 
                href={isTarget(item) ? `/target/${item.id}` : `/disclosure/${item.id}`} 
                key={item.id} 
                className="block"
              >
                <Card className="bg-custom-card !important border-none hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-manrope font-bold text-[22px] text-custom-text !important truncate">
                        {isTarget(item) ? item.target_name : item.description}
                      </h3>
                      <Badge variant="secondary" className="text-sm">
                        {isTarget(item) ? item.status || 'Not Started' : item.status || 'Not Started'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {(groupedDisclosures[selectedSection as keyof GroupedDisclosures] || []).length === 0 && (
          <p className="text-center text-gray-500 mt-8">No disclosures or targets found for this section.</p>
        )}

        {selectedSection === 'Targets & actions' && (
          <Button 
            className="mb-8 bg-custom-accent text-white hover:bg-custom-accent/90 rounded-full px-4 h-[35px]"
            onClick={() => setIsCreateTargetModalOpen(true)}
          >
            <Plus size={20} className="mr-2" /> Add new target
          </Button>
        )}
      </div>

      {currentUser?.profile?.user_role === 'Administrator' && (
        <AssignOwnerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAssign={handleAssignOwnerConfirm}
          onRemove={handleRemoveOwner}
          companyId={currentUser?.profile?.company}
          currentOwnerId={currentOwnerId}
        />
      )}

      <CreateTargetModal
        isOpen={isCreateTargetModalOpen}
        onClose={() => setIsCreateTargetModalOpen(false)}
        onSave={handleCreateTarget}
        companyId={currentUser?.profile?.company}
        userId={currentUser?.id}
        topicId={topicId}
      />
    </div>
  );
}
