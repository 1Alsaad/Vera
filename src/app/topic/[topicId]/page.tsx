'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { FaHome, FaBell, FaUser, FaRobot, FaPaperclip, FaComments, FaSearch, FaArrowRight } from 'react-icons/fa';
import { withAuth } from '../../../components/withAuth';
import { format } from 'date-fns';
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/mode-toggle";
import AssignOwnerModal from '@/components/AssignOwnerModal';
import CreateTargetModal from '@/components/CreateTargetModal';
import Breadcrumb from '@/components/Breadcrumb';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Disclosure {
  id: string;
  reference: string;
  description: string;
  metric_type: string;
  materiality: string;
  status: string;
  last_edited: string;
  ownerId: string | null;
  target_name?: string; // Add this line
  // Add other relevant fields
}

interface Target {
  id: string;
  target_name: string;
  target_value: string;
  target_year: string;
  baseline_value: string;
  baseline_year: string;
  // Add other relevant target fields
}

interface GroupedDisclosures {
  [key: string]: (Disclosure | Target)[];
}

export default withAuth(TopicPage);

function TopicPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = typeof params.topicId === 'string' ? decodeURIComponent(params.topicId) : '';
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
    if (currentUser) {
      fetchDisclosuresAndTargets();
    }
  }, [currentUser, topicId, selectedSection]);

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

  async function fetchDisclosuresAndTargets() {
    if (!currentUser?.profile?.company || !currentUser?.profile?.id || !topicId) {
      setError('User information or selected topic is incomplete.');
      return;
    }

    const { company, id: userId, user_role: userRole } = currentUser.profile;

    try {
      let disclosures;

      if (userRole === 'Administrator') {
        // Administrator role logic
        const { data: materialDisclosures, error: materialError } = await supabase
          .from('disclosure_materiality_assessments')
          .select('reference')
          .eq('company', company)
          .eq('materiality', 'Material')
          .eq('topic', topicId)
          .order('reference', { ascending: true });

        if (materialError) throw materialError;

        const materialReferences = materialDisclosures.map(d => d.reference);

        const { data, error } = await supabase
          .from('disclosures')
          .select(`
            *,
            tasks:tasks(id),
            task_owners:task_owners(user_id)
          `)
          .eq('topic', topicId)
          .in('reference', materialReferences)
          .order('reference', { ascending: true });

        if (error) throw error;
        disclosures = data;
      } else {
        // Non-admin role logic
        const { data, error } = await supabase
          .from('disclosures')
          .select(`
            *,
            tasks:tasks!inner(id, company),
            task_owners:task_owners!inner(user_id)
          `)
          .eq('topic', topicId)
          .eq('tasks.company', company)
          .eq('task_owners.user_id', userId)
          .order('reference', { ascending: true });

        if (error) throw error;
        disclosures = data;
      }

      const grouped: GroupedDisclosures = {
        Strategy: [],
        'Impacts, risks and opportunity management': [],
        Metrics: [],
        'Targets & actions': [],
      };

      disclosures.forEach(disclosure => {
        disclosure.ownerId = disclosure.task_owners[0]?.user_id || null;
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
            // If the metric_type doesn't match any of the above, add it to 'Targets & actions'
            grouped['Targets & actions'].push(disclosure);
        }
      });

      // Fetch targets
      const { data: targets, error: targetsError } = await supabase
        .from('targets')
        .select('*')
        .eq('topic', topicId)
        .eq('company', company);

      if (targetsError) throw targetsError;

      // Add targets to the 'Targets & actions' section
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
            task_id: selectedDisclosureId, 
            user_id: userId,
            company: currentUser?.profile?.company
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

  return (
    <div className="flex min-h-screen bg-[#DDEBFF] dark:bg-gray-900 text-[#1F2937] dark:text-gray-100 text-base font-poppins">
      {/* Left Sidebar */}
      <aside className="w-80 bg-[#DDEBFF] dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 p-4 pt-12 flex flex-col">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-[#1F2937] dark:text-gray-100 hover:text-[#3B82F6] dark:hover:text-[#3B82F6]">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </Link>
        </div>
        
        {/* Center the search box */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-[230px]">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[30px] px-4 py-1 rounded-[25px] border border-gray-300 dark:border-gray-600 bg-transparent text-[#1F2937] dark:text-gray-100 placeholder-[#1F2937] dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {/* Added margin-top to bring title and options down */}
        <div className="mt-6">
          <h2 className="text-[16px] font-bold mb-4">{topicId}</h2>
          
          <nav className="space-y-5">
            {filteredSections.map((section) => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`block w-full text-left py-2 px-4 rounded-[6px] transition-colors duration-200 ${
                  selectedSection === section 
                    ? 'text-[#3B82F6] font-medium' // Changed selected state styling
                    : 'text-[#1F2937] dark:text-gray-300 hover:bg-[#3B82F6] hover:bg-opacity-10'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 pt-24 overflow-y-auto bg-[#DDEBFF] dark:bg-gray-900"> {/* Added pt-24 for top padding */}
        <div className="flex justify-between items-center mb-8"> {/* Increased margin-bottom */}
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-gray-100">{selectedSection}</h1>
          <ModeToggle />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4 mt-8"> {/* Added mt-8 for top margin */}
          {groupedDisclosures[selectedSection]?.map((item) => (
            <Link 
              href={isTarget(item) ? `/target/${item.id}` : `/disclosure/${item.id}`} 
              key={item.id} 
              className="block"
            >
              <div className="h-[100px] bg-transparent dark:bg-transparent rounded-[10px] overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-300 dark:border-gray-600 shadow-[0_0_2px_2px_rgba(0,0,0,0.05)] flex items-center justify-between px-4">
                <div className="flex items-center space-x-4 flex-grow">
                  <h3 className="font-manrope font-bold text-[22px] text-[#1F2937] dark:text-gray-100 truncate">
                    {isTarget(item) ? item.target_name : item.description}
                  </h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#030712] text-white">
                    {isTarget(item) ? 'Target' : item.status || 'Not Started'}
                  </span>
                </div>
                {isTarget(item) && (
                  <svg className="w-4 h-4 text-black dark:text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </Link>
          ))}
        </div>

        {groupedDisclosures[selectedSection]?.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No disclosures or targets found for this section.</p>
        )}

        {selectedSection === 'Targets & actions' && (
          <div className="mt-6">
            <button
              onClick={() => setIsCreateTargetModalOpen(true)}
              className="h-10 px-4 rounded-[10px] bg-[#111827] text-sm font-medium text-white hover:bg-opacity-90 transition-colors duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add new target
            </button>
          </div>
        )}
      </main>
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