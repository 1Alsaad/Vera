'use client';

import { FaChartBar, FaClipboardList, FaBell, FaCalendarAlt, FaSearch, FaHome, FaUser, FaChevronRight } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Bubble, Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, BubbleController } from 'chart.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { withAuth } from '../components/withAuth';
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, BubbleController);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Topic {
  title: string;
  esg: 'General Information'| 'Environmental' | 'Social' | 'Governance';
}

interface Notification {
  id: number;
  user_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

function Home() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchTopics();
    fetchNotifications();
    subscribeToNotifications();

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchTopics = async () => {
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
  };

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      }
    }
  };

  const subscribeToNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();
    }
  };

  const markAsRead = async (notificationId: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Parse the notification message to determine the destination
    if (notification.message.includes('New message in task')) {
      const taskId = notification.message.match(/task (\d+)/)?.[1];
      if (taskId) {
        router.push(`/disclosure/${taskId}`);
      }
    } else if (notification.message.includes('assigned to task')) {
      const taskId = notification.message.match(/task (\d+)/)?.[1];
      if (taskId) {
        router.push(`/disclosure/${taskId}`);
      }
    } else if (notification.message.includes('new disclosure')) {
      const disclosureId = notification.message.match(/disclosure (\d+)/)?.[1];
      if (disclosureId) {
        router.push(`/disclosure/${disclosureId}`);
      }
    } else if (notification.message.includes('new target')) {
      router.push('/targets'); // Assuming you have a targets page
    } else if (notification.message.includes('new action')) {
      router.push('/actions'); // Assuming you have an actions page
    }
    // Add more conditions as needed for other types of notifications
  };

  const renderNotification = (notification: Notification) => (
    <div 
      key={notification.id} 
      className={`p-2 ${notification.read ? 'bg-gray-100' : 'bg-blue-100'} mb-2 rounded cursor-pointer`}
      onClick={() => handleNotificationClick(notification)}
    >
      <p>{notification.message}</p>
      <small>{new Date(notification.created_at).toLocaleString()}</small>
    </div>
  );

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

  const barData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue',
      data: [12, 19, 3, 5],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  const doughnutData = {
    labels: ['Environmental', 'Social', 'Governance'],
    datasets: [{
      data: [300, 50, 100],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#DDEBFF] dark:bg-gray-900 text-[#1F2937] dark:text-gray-100 text-base font-poppins">
      {/* Left Sidebar */}
      <aside className="w-[260px] bg-[#DDEBFF] dark:bg-gray-800 border-r border-black dark:border-white border-solid flex flex-col">
        <div className="flex flex-col h-full py-6">
          <div className="px-4 mb-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={handleSearch}
                className="w-full h-[30px] py-1 px-3 text-sm rounded-[16px] border border-black dark:border-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-50 bg-transparent" 
              />
            </div>
          </div>
          <nav className="flex-grow flex flex-col justify-between mt-[100px] mb-6 overflow-y-auto">
            {error && <p className="px-4 text-red-500">{error}</p>}
            {filteredTopics.length === 0 && !error && <p className="px-4 text-gray-500">No matching topics found</p>}
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              {['General Information', 'Environmental', 'Social'].map((category, index) => (
                <div key={category} className={index === 0 ? '' : 'mt-auto'}>
                  <h3 className="px-4 py-2 text-sm font-poppins font-medium text-gray-500 uppercase">{category}</h3>
                  {filteredTopics
                    .filter(topic => topic.esg === category)
                    .map((topic, index) => (
                      <Link 
                        key={index} 
                        href={`/topic/${encodeURIComponent(topic.title)}`}
                        className="flex items-center py-2 px-4 text-black hover:bg-[#C7DBFF] font-manrope font-[450] text-base group"
                      >
                        <span className="flex-grow mr-2 truncate">{topic.title}</span>
                        <FaChevronRight className="text-black flex-shrink-0" />
                      </Link>
                    ))
                  }
                  {filteredTopics.filter(topic => topic.esg === category).length === 0 && (
                    <p className="px-6 text-sm text-gray-400">No topics in this category</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <h3 className="px-4 py-2 text-sm font-poppins font-medium text-gray-500 uppercase">Governance</h3>
              {filteredTopics
                .filter(topic => topic.esg === 'Governance')
                .map((topic, index) => (
                  <Link 
                    key={index} 
                    href={`/topic/${encodeURIComponent(topic.title)}`}
                    className="flex items-center py-2 px-4 text-black hover:bg-[#C7DBFF] font-manrope font-[450] text-base group"
                  >
                    <span className="flex-grow mr-2 truncate">{topic.title}</span>
                    <FaChevronRight className="text-black flex-shrink-0" />
                  </Link>
                ))
              }
              {filteredTopics.filter(topic => topic.esg === 'Governance').length === 0 && (
                <p className="px-6 text-sm text-gray-400">No topics in this category</p>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/get-started" className="btn w-[140px]">
                Get Started
              </Link>
              <button className="btn w-[140px]">
                Create Report
              </button>
              <FaHome className="text-[#1F2937] text-2xl cursor-pointer" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative">
                    <FaBell className="text-[#1F2937] text-2xl cursor-pointer" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(renderNotification)
                    ) : (
                      <p className="p-4">No notifications</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <FaUser 
                className="text-[#1F2937] text-2xl cursor-pointer" 
                onClick={handleProfileClick}
              />
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Content Container */}
          <div className="relative">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-transparent dark:bg-transparent p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
                <p className="text-3xl font-bold">24</p>
              </div>
              <div className="bg-transparent dark:bg-transparent p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-2">Completed Tasks</h3>
                <p className="text-3xl font-bold">18</p>
              </div>
              <div className="bg-transparent dark:bg-transparent p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-2">Pending Reports</h3>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="bg-transparent dark:bg-transparent p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-2">ESG Score</h3>
                <p className="text-3xl font-bold">78%</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-transparent dark:bg-transparent rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Sustainability Score</h2>
                <div className="h-64">
                  <Bubble data={bubbleData} />
                </div>
              </div>
              <div className="bg-transparent dark:bg-transparent rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Carbon Emissions</h2>
                <div className="h-64">
                  <Line data={lineData} />
                </div>
              </div>
              <div className="bg-transparent dark:bg-transparent rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Quarterly Revenue</h2>
                <div className="h-64">
                  <Bar data={barData} />
                </div>
              </div>
              <div className="bg-transparent dark:bg-transparent rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">ESG Distribution</h2>
                <div className="h-64">
                  <Doughnut data={doughnutData} />
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-transparent dark:bg-transparent rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Updated sustainability policy</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Completed Q2 environmental assessment</span>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Submitted annual ESG report</span>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </li>
              </ul>
            </div>

            {/* Blurred Overlay */}
            <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center">
              <div className="text-2xl font-light text-gray-600 dark:text-gray-300">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(Home);
