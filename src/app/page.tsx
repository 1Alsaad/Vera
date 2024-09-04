'use client';

import Image from "next/image";
import { FaChartBar, FaClipboardList, FaBell, FaCalendarAlt, FaSearch, FaHome, FaUser, FaArrowRight } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Bubble, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BubbleController } from 'chart.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { withAuth } from '../components/withAuth';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ModeToggle } from "@/components/mode-toggle";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BubbleController);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Topic {
  title: string;
  esg: 'General Information'| 'Environmental' | 'Social' | 'Governance';
}

function Home() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchTopics() {
      const { data, error } = await supabase
        .from('topics')
        .select('title, esg');
      
      if (error) {
        console.error('Error fetching topics:', error);
        setError('Failed to fetch topics');
      } else if (data) {
        console.log('Fetched topics:', data);
        setTopics(data as Topic[]);
        setFilteredTopics(data as Topic[]);
      } else {
        setError('No topics found');
      }
    }

    fetchTopics();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    
    const filtered = topics.filter(topic => 
      topic.title.toLowerCase().includes(searchTerm)
    );
    setFilteredTopics(filtered);
  };

  const bubbleData = {
    datasets: [{
      label: 'Sustainability Score',
      data: [
        { x: 20, y: 30, r: 15 },
        { x: 40, y: 10, r: 10 },
        { x: 30, y: 20, r: 8 },
      ],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Carbon Emissions',
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <div className="flex min-h-screen bg-[#DDEBFF] dark:bg-gray-900 text-[#1F2937] dark:text-gray-100 text-base font-poppins">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#DDEBFF] dark:bg-gray-800 border-r border-[#71A1FC] dark:border-gray-700 flex flex-col">
        <div className="p-6">
          <Image src="/logo.svg" alt="Company Logo" width={120} height={40} />
        </div>
        <div className="px-4 mb-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full h-10 py-2 pl-10 pr-4 text-sm rounded-full border border-[#71A1FC] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-50 bg-transparent" 
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          </div>
        </div>
        <nav className="flex-grow overflow-y-auto mt-8 space-y-8 mb-8">
          {error && <p className="px-4 text-red-500">{error}</p>}
          {filteredTopics.length === 0 && !error && <p className="px-4 text-gray-500">No matching topics found</p>}
          {['General Information', 'Environmental', 'Social', 'Governance'].map((category) => (
            <div key={category} className="mb-8"> {/* Changed from mb-5 to mb-8 */}
              <h3 className="px-4 py-2 text-sm font-poppins font-extralight text-gray-500 uppercase">{category}</h3>
              {filteredTopics
                .filter(topic => topic.esg === category)
                .map((topic, index) => (
                  <Link 
                    key={index} 
                    href={`/topic/${encodeURIComponent(topic.title)}`}
                    className="flex justify-between items-center py-3 px-6 text-black hover:bg-[#DDEBFF] font-poppins font-medium group"
                  >
                    <span>{topic.title}</span>
                    <FaArrowRight className="text-sm" />
                  </Link>
                ))
              }
              {filteredTopics.filter(topic => topic.esg === category).length === 0 && (
                <p className="px-6 text-sm text-gray-400">No topics in this category</p>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto flex flex-col">
        <div className="flex justify-end items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/get-started" className="h-10 text-[#1F2937] px-4 rounded-[0.8px] border border-[#71A1FC] hover:bg-[#F3F4F6] flex items-center justify-center transition duration-300 font-light">
              Get Started
            </Link>
            <button className="h-10 text-[#1F2937] px-4 rounded-[0.8px] border border-[#71A1FC] hover:bg-[#F3F4F6] transition duration-300 font-light">
              Create Report
            </button>
            <FaHome className="text-[#1F2937] text-2xl cursor-pointer" />
            <FaBell className="text-[#1F2937] text-2xl cursor-pointer" />
            <FaUser 
              className="text-[#1F2937] text-2xl cursor-pointer" 
              onClick={handleProfileClick}
            />
            <ModeToggle />
          </div>
        </div>
        
        {/* Cards Section */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-transparent border border-[#71A1FC] rounded-lg p-6">
            <h2 className="text-[1.25rem] font-semibold mb-4 flex items-center">
              <FaClipboardList className="mr-2 text-[#10B981]" /> Tasks
            </h2>
            <ul className="space-y-2">
              <li>Complete environmental assessment</li>
              <li>Update sustainability policy</li>
              <li>Review supply chain data</li>
            </ul>
          </div>
          <div className="bg-transparent border border-[#71A1FC] rounded-lg p-6">
            <h2 className="text-[1.25rem] font-semibold mb-4 flex items-center">
              <FaBell className="mr-2 text-[#10B981]" /> Notifications
            </h2>
            <ul className="space-y-2">
              <li>New CSRD guideline published</li>
              <li>Quarterly report due in 2 weeks</li>
              <li>Stakeholder meeting scheduled</li>
            </ul>
          </div>
          <div className="bg-transparent border border-[#71A1FC] rounded-lg p-6">
            <h2 className="text-[1.25rem] font-semibold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-[#10B981]" /> Upcoming Deadlines
            </h2>
            <ul className="space-y-2">
              <li>May 15: Submit Q2 sustainability report</li>
              <li>June 1: Annual ESG disclosure</li>
              <li>July 10: Carbon footprint assessment</li>
            </ul>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-transparent border border-[#71A1FC] rounded-lg p-6">
            <h2 className="text-[1.25rem] font-semibold mb-4">Sustainability Score</h2>
            <div className="h-64">
              <Bubble data={bubbleData} />
            </div>
          </div>
          <div className="bg-transparent border border-[#71A1FC] rounded-lg p-6">
            <h2 className="text-[1.25rem] font-semibold mb-4">Carbon Emissions</h2>
            <div className="h-64">
              <Line data={lineData} />
            </div>
          </div>
        </div>

        {/* Added space at the bottom */}
        <div className="flex-grow"></div>
      </main>
    </div>
  );
}

export default withAuth(Home);
