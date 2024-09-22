'use client';

import { Home as HomeIcon, Bell, User, ChevronRight, Search, Calendar, Clipboard, BarChart, TrendingUp, Users, ShieldCheck, PieChart } from 'lucide-react'
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
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  priority: 'high' | 'medium' | 'low';
}

interface Task {
  id: number;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked';
  due_date: string;
  owner: string;
}

function HomePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [materialityProgress, setMaterialityProgress] = useState(0);
  const [overallTargetProgress, setOverallTargetProgress] = useState(0);
  const [actionProgress, setActionProgress] = useState(0);
  const [overdueActions, setOverdueActions] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reportCompletion, setReportCompletion] = useState(0);

  useEffect(() => {
    fetchTopics();
    fetchNotifications();
    subscribeToNotifications();
    fetchDashboardData();
    fetchTasks();

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

  const fetchDashboardData = async () => {
    // Fetch materiality assessment data
    const { data: materialityData } = await supabase
      .from('topic_materiality_assessments')
      .select('*');

    if (materialityData) {
      const assessedTopics = materialityData.filter(topic => topic.materiality !== 'To Assess').length;
      const totalTopics = materialityData.length;
      setMaterialityProgress((assessedTopics / totalTopics) * 100);
    }

    // Fetch targets data
    const { data: targetsData } = await supabase
      .from('targets')
      .select('*');

    if (targetsData) {
      const completedTargets = targetsData.filter(target => target.current_value >= parseFloat(target.target_value)).length;
      setOverallTargetProgress((completedTargets / targetsData.length) * 100);
    }

    // Fetch actions data
    const { data: actionsData } = await supabase
      .from('actions')
      .select('*');

    if (actionsData) {
      const completedActions = actionsData.filter(action => action.status === 'Completed').length;
      setActionProgress((completedActions / actionsData.length) * 100);
      setOverdueActions(actionsData.filter(action => 
        action.status !== 'Completed' && new Date(action.due_date) < new Date()
      ).length);
    }

    // Add logic to fetch report completion status
    const { data: reportData } = await supabase
      .from('reports')
      .select('*')
      .single();
    
    if (reportData) {
      setReportCompletion(reportData.completion_percentage || 0);
    }
  };

  const fetchTasks = async () => {
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (tasksData) {
      setTasks(tasksData);
    }
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
              <Link href="/surveys">
                <Button variant="outline" className="border-custom-accent text-custom-accent hover:bg-custom-accent/10">
                  <PieChart className="mr-2 h-4 w-4" />
                  Surveys
                </Button>
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
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-custom-card border-none">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Materiality Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={materialityProgress} className="w-full" />
                  <p className="mt-2 text-2xl font-bold">{materialityProgress.toFixed(0)}%</p>
                </CardContent>
              </Card>

              <Card className="bg-custom-card border-none">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Overall Target Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={overallTargetProgress} className="w-full" />
                  <p className="mt-2 text-2xl font-bold">{overallTargetProgress.toFixed(0)}%</p>
                </CardContent>
              </Card>

              <Card className="bg-custom-card border-none">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Action Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={actionProgress} className="w-full" />
                  <p className="mt-2 text-2xl font-bold">{actionProgress.toFixed(0)}%</p>
                  <p className="mt-2 text-sm text-gray-500">Overdue: {overdueActions}</p>
                </CardContent>
              </Card>

              <Card className="bg-custom-card border-none">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Report Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={reportCompletion} className="w-full" />
                  <p className="mt-2 text-2xl font-bold">{reportCompletion.toFixed(0)}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications */}
            <Card className="bg-custom-card border-none">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-custom-text">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .sort((a, b) => b.priority.localeCompare(a.priority))
                    .slice(0, 5)
                    .map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-lg ${
                        notification.priority === 'high' ? 'bg-red-100 dark:bg-red-900' :
                        notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-green-100 dark:bg-green-900'
                      }`}>
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="bg-custom-card border-none">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-custom-text">My Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.slice(0, 5).map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Update</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-custom-card border-none">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-custom-text">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {/* Replace with actual recent activity data */}
                  <li>New data entered for Environmental Disclosure E1</li>
                  <li>Target T1 updated: Completion date extended</li>
                  <li>Task "Review Social Policies" marked as complete</li>
                  <li>New comment on Governance Disclosure G2</li>
                  <li>Sustainability policy updated</li>
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
