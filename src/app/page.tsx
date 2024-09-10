'use client';

import { Home as HomeIcon, Bell, User, ChevronRight, Search, Calendar, Clipboard, BarChart, TrendingUp, Users, ShieldCheck } from 'lucide-react'
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Bubble, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BubbleController } from 'chart.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { withAuth } from '../components/withAuth';
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface Notification {
  id: number;
  user_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

function HomePage() {
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
      className={`p-4 ${notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900'} mb-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.message}</p>
        {!notification.read && (
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
      </p>
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

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-custom-bg text-custom-text font-poppins">
      {/* Left Sidebar */}
      <aside className="w-[260px] bg-transparent border-r border-black dark:border-white flex flex-col">
        <div className="flex flex-col h-full py-8">
          <div className="px-6 mb-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={handleSearch}
                className="w-full h-[30px] py-2 px-4 text-sm rounded-[20px] border border-black dark:border-white focus:outline-none focus:ring-2 focus:ring-custom-accent focus:ring-opacity-50 bg-transparent" 
              />
            </div>
          </div>
          <nav className="flex-grow flex flex-col space-y-8 overflow-y-auto px-6">
            {error && <p className="text-red-500">{error}</p>}
            {filteredTopics.length === 0 && !error && <p className="text-gray-500">No matching topics found</p>}
            {['General Information', 'Environmental', 'Social', 'Governance'].map((category) => (
              <div key={category}>
                <h3 className="text-sm font-poppins font-medium text-gray-500 uppercase mb-4">{category}</h3>
                <ul className="space-y-3">
                  {filteredTopics
                    .filter(topic => topic.esg === category)
                    .map((topic, index) => (
                      <li key={index}>
                        <Link 
                          href={`/topic/${encodeURIComponent(topic.title)}`}
                          className="flex items-center py-2 px-3 text-custom-text font-manrope font-[450] text-base rounded-full transition-colors duration-200 hover:bg-[#020B19]/10 dark:hover:bg-gray-800 "
                        >
                          <span className="flex-grow mr-2 truncate">{topic.title}</span>
                          <ChevronRight className="text-custom-text flex-shrink-0" size={18} />
                        </Link>
                      </li>
                    ))
                  }
                  {filteredTopics.filter(topic => topic.esg === category).length === 0 && (
                    <li className="text-sm text-gray-400">No topics in this category</li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-transparent">
        {/* Header */}
        <div className="p-8 bg-transparent">
          <div className="flex justify-end items-center">
            <div className="flex items-center space-x-4">
              <Link href="/get-started">
                <Button variant="default" className="bg-custom-accent text-white hover:bg-custom-accent/90">Get Started</Button>
              </Link>
              <Link href="/create-report">
                <Button variant="outline" className="border-custom-accent text-custom-accent hover:bg-custom-accent/10">Create Report</Button>
              </Link>
              <HomeIcon className="text-custom-accent cursor-pointer" size={24} />
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer">
                    <Bell className="text-custom-accent" size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                  </div>
                  <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? (
                      <div className="p-4">
                        {notifications.map(renderNotification)}
                      </div>
                    ) : (
                      <p className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</p>
                    )}
                  </ScrollArea>
                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <Button variant="outline" className="w-full" onClick={() => {/* Implement mark all as read */}}>
                        Mark all as read
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <User 
                className="text-custom-accent cursor-pointer" 
                onClick={handleProfileClick}
                size={24}
              />
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Content Container */}
          <div className="grid gap-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Tasks", value: 24, icon: Clipboard, change: "+2 from last week" },
                { title: "Completed Tasks", value: 18, icon: TrendingUp, change: "75% completion rate" },
                { title: "Pending Reports", value: 3, icon: Calendar, change: "Due in 5 days" },
                { title: "ESG Score", value: "78%", icon: BarChart, change: "+5% from last quarter" },
              ].map((stat, index) => (
                <Card key={index} className="bg-custom-card border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-custom-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-custom-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-custom-accent">Sustainability Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bubble data={bubbleData} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-custom-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-custom-accent">Carbon Emissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line data={lineData} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card className="bg-custom-card border-none">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-custom-text">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: "Updated sustainability policy", time: "2 hours ago" },
                    { icon: BarChart, text: "Completed Q2 environmental assessment", time: "1 day ago" },
                    { icon: Users, text: "Submitted annual ESG report", time: "3 days ago" },
                  ].map((activity, index) => (
                    <li key={index} className="flex justify-between items-center p-3 bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <activity.icon className="text-custom-accent" size={20} />
                        <span>{activity.text}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomePage);
