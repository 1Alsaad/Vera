//src\app\disclosure\[disclosureId]\page.tsx

'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { withAuth } from '../../../components/withAuth';
import { FaRobot,FaUser, FaPaperclip, FaComments, FaEye, FaArrowLeft, FaEllipsisV, FaReply, FaUpload, FaTimes, FaTrash } from 'react-icons/fa';
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { toast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const supabaseUrl = 'https://tmmmdyykqbowfywwrwvg.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey!);

type Task = Database['public']['Tables']['tasks']['Row'];
type DataPoint = Database['public']['Tables']['data_points']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type File = Database['public']['Tables']['files']['Row'];

interface CombinedTask extends Task {
  id: number;
  dataPointDetails: DataPoint;
  importedValue?: string;
  messages?: Message[];
  files?: File[];
}

type BrowserFile = File & { name: string };

const BATCH_SIZE = 50;

function DisclosureDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const disclosureId = params?.disclosureId as string;
  const searchParams = useSearchParams();
  const topic = searchParams?.get('topic') || null;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [combinedTasks, setCombinedTasks] = useState<CombinedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [disclosureTitle, setDisclosureTitle] = useState<string>('');
  const [disclosureReference, setDisclosureReference] = useState<string>('');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [suggestedMappings, setSuggestedMappings] = useState<{ [key: string]: string }>({});
  const [activeCard, setActiveCard] = useState<'chat' | 'files' | 'ai'>('chat');
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVeraLoading, setIsVeraLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const { toast } = useToast();
  const [debouncedCombinedTasks] = useDebounce(combinedTasks, 500);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<{ [key: number]: string[] }>({});
  const [taskOwners, setTaskOwners] = useState<{ [key: number]: string[] }>({});
  const [ownersAvatars, setOwnersAvatars] = useState<{ [key: string]: string }>({});

  const getUserProfile = async (userId: string): Promise<{ avatar_url?: string, firstname?: string, lastname?: string } | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, firstname, lastname')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, firstname, lastname');

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

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
    if (!currentUser || !currentUser.profile) return;

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

        const taskIds = taskOwners.map((to: { task_id: number }) => to.task_id);
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

      const combined: CombinedTask[] = await Promise.all(tasks.map(async task => {
        const dataPointDetails = (dataPoints as DataPoint[]).find(dp => dp.id === task.datapoint) || {} as DataPoint;
                 
        // Fetch messages for this task
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('task_id', task.id)
          .order('inserted_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Fetch files for this task
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .eq('task_id', task.id);

        if (filesError) throw filesError;

        // Fetch reporting data for this task
        const { data: reportingData, error: reportingDataError } = await supabase
          .from('reporting_data')
          .select('value')
          .eq('task_id', task.id)
          .eq('company', currentUser.profile.company)
          .single();

        if (reportingDataError && reportingDataError.code !== 'PGRST116') {
          throw reportingDataError;
        }

        return {
          ...task,
          dataPointDetails,
          importedValue: reportingData ? reportingData.value : '',
          messages,
          files
        };
      }));

      setCombinedTasks(combined);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [currentUser, disclosureId]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        fetchCurrentUser(user.id);
      }
    }

    checkAuth();
  }, [router]);

  async function fetchCurrentUser(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      setError('Error fetching user profile');
    } else if (data) {
      setCurrentUser({ id: userId, profile: data });
    }
  }

  useEffect(() => {
    if (currentUser && disclosureId) {
      fetchTasksAndDataPoints();
      fetchDisclosureReference();
    }
  }, [currentUser, disclosureId, fetchTasksAndDataPoints, fetchDisclosureReference]);

  const fetchMessages = useCallback(async (taskId: number) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('task_id', taskId)
        .eq('company', currentUser.profile.company)
        .order('inserted_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages');
    }
  }, [currentUser]);

  const fetchFiles = useCallback(async (taskId: number) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('task_id', taskId)
        .eq('company', currentUser.profile.company);

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files');
    }
  }, [currentUser]);

  const handleCardOpen = (type: 'chat' | 'files' | 'ai', taskId: number) => {
    setActiveTaskId(taskId);
    setActiveCard(type);

    if (type === 'chat') {
      fetchMessages(taskId);
    } else if (type === 'files') {
      fetchFiles(taskId);
    } else if (type === 'ai') {
      setAiMessages([]);
    }
  };

  const sendMessage = async (taskId: number, repliedToId: number | null = null) => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          task_id: taskId,
          author: `${currentUser.profile.firstname} ${currentUser.profile.lastname}`,
          message: newMessage.trim(),
          company: currentUser.profile.company,
          email: currentUser.email,
          replied_to: repliedToId,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prevMessages => [...prevMessages, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };

  const editMessage = async (messageId: number) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ message: editedMessage, last_updated: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      setMessages(prevMessages => prevMessages.map(msg => msg.id === messageId ? data : msg));
      setEditingMessageId(null);
      setEditedMessage('');
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message');
    }
  };

  const scrollToMessage = (messageId: number) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-blue-100', 'dark:bg-blue-900');
      setTimeout(() => {
        messageElement.classList.remove('bg-blue-100', 'dark:bg-blue-900');
      }, 2000);
    }
  };

  const renderMessage = (message: Message) => (
    <div 
    key={message.id} 
    ref={(el) => { messageRefs.current[message.id] = el }}
      className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-2 transition-colors duration-300"
    >
      {message.replied_to && (
        <div 
          className="text-sm text-blue-500 mb-1 cursor-pointer hover:underline"
          onClick={() => scrollToMessage(message.replied_to!)}
        >
          Replying to: {messages.find((m: Message) => m.id === message.replied_to)?.message.substring(0, 50)}...
        </div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{message.author}</p>
          {editingMessageId === message.id ? (
            <Textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="mt-1"
            />
          ) : (
            <p>{message.message}</p>
          )}
          <p className="text-xs text-gray-500">
            {new Date(message.inserted_at).toLocaleString()}
            {message.last_updated && ` (edited: ${new Date(message.last_updated).toLocaleString()})`}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><FaEllipsisV /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setReplyingToId(message.id)}>
              <FaReply className="mr-2" /> Reply
            </DropdownMenuItem>
            {currentUser?.email === message.email && (
              <>
                <DropdownMenuItem onSelect={() => {
                  setEditingMessageId(message.id);
                  setEditedMessage(message.message);
                }}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => deleteMessage(message.id)}>
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {editingMessageId === message.id && (
        <div className="mt-2">
          <Button onClick={() => editMessage(message.id)} className="mr-2">Save</Button>
          <Button variant="outline" onClick={() => setEditingMessageId(null)}>Cancel</Button>
        </div>
      )}
    </div>
  );

  const sendVeraMessage = async () => {
    if (!aiInput.trim() || !activeTaskId || !currentUser) return;

    setIsVeraLoading(true);
    setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: aiInput,
          taskId: activeTaskId.toString(),
          userId: currentUser.id,
          sessionId: Date.now().toString(),
          company: currentUser.profile.company,
          firstName: currentUser.profile.firstname,
          lastName: currentUser.profile.lastname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to get Vera response: ${response.status} ${response.statusText}. Details: ${JSON.stringify(data)}`);
      }

      setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Detailed error in Vera chat:', error);
      setError('Failed to get Vera response: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsVeraLoading(false);
      setAiInput('');
    }
  };

  const formatVeraResponse = (content: string) => {
    // Add line breaks before bullet points and numbered lists
    content = content.replace(/•/g, '\n•');
    content = content.replace(/(\d+\.)/g, '\n$1');
    
    // Convert bullet points to markdown list items
    content = content.replace(/^•\s*/gm, '- ');
    
    // Add line breaks and markdown syntax for headings
    content = content.replace(/^(.*:)$/gm, '\n## $1\n');
    
    // Add emphasis to key terms
    content = content.replace(/\b(ESG|Environmental|Social|Governance)\b/g, '**$1**');
    
    // Add horizontal rules for better section separation
    content = content.replace(/\n{2,}/g, '\n\n---\n\n');
    
    return content;
  };

  // Add this function to handle file viewing
  const viewFile = async (fileDestination: string) => {
    try {
      // Assuming fileDestination is in the format "bucketName/path/to/file.ext"
      const [bucketName, ...pathParts] = fileDestination.split('/');
      const filePath = pathParts.join('/');
  
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(filePath, 60); // URL expires in 60 seconds
  
      if (error) throw error;
  
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      setError('Failed to view file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const deleteFile = async (fileId: number, fileDestination: string) => {
    try {
      // Delete from Supabase storage
      const { error: storageError } = await supabase.storage
        .from(currentUser.profile.company)
        .remove([fileDestination]);
  
      if (storageError) throw storageError;
  
      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);
  
      if (dbError) throw dbError;
  
      // Update local state
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Add this function to handle data import
  const handleImportData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add this function to handle file selection and parsing
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setImportedData(jsonData);
        const suggestedMappings = suggestMappings(jsonData[0], combinedTasks);
        setSuggestedMappings(suggestedMappings);
        setShowImportDialog(true);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const suggestMappings = (firstRow: any, tasks: CombinedTask[]) => {
    const mappings: { [key: string]: string } = {};
    Object.keys(firstRow).forEach(key => {
      const matchingTask = tasks.find(task => 
        task.dataPointDetails.name?.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(task.dataPointDetails.name?.toLowerCase() || '')
      );
      if (matchingTask) {
        mappings[key] = matchingTask.id.toString();
      }
    });
    return mappings;
  };

  const processImportedData = (mappings: { [key: string]: string }, applyToAll: boolean) => {
    const updatedTasks = combinedTasks.map(task => {
      const matchingColumn = Object.entries(mappings).find(([_, value]) => value === task.id.toString())?.[0];
      if (matchingColumn) {
        if (applyToAll) {
          // Apply the first matching value from any row
          const matchingData = importedData.find(row => row[matchingColumn] !== undefined);
          if (matchingData) {
            return { ...task, importedValue: matchingData[matchingColumn] };
          }
        } else {
          // Apply only the first row's value
          const firstRowData = importedData[0];
          if (firstRowData && firstRowData[matchingColumn] !== undefined) {
            return { ...task, importedValue: firstRowData[matchingColumn] };
          }
        }
      }
      return task;
    });

    setCombinedTasks(updatedTasks);
    setShowImportDialog(false);

    // Insert updated tasks into the database
    updatedTasks.forEach(async (task) => {
      if (task.importedValue !== undefined) {
        await saveTaskValue(task.id, task.importedValue);
      }
    });
  };

  const saveTaskValue = async (taskId: number, value: string) => {
    if (!currentUser || !disclosureId) return;
  
    try {
      // Check if the record exists
      const { data, error: selectError } = await supabase
        .from('reporting_data')
        .select()
        .eq('task_id', taskId)
        .eq('disclosure', disclosureId)
        .eq('company', currentUser.profile.company)
        .single();
  
      if (selectError && selectError.code !== 'PGRST116') throw selectError;
  
      if (data) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('reporting_data')
          .update({
            value: value,
            last_updated_by: currentUser.id
          })
          .eq('id', data.id);
  
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('reporting_data')
          .insert({
            task_id: taskId,
            value: value,
            disclosure: disclosureId,
            company: currentUser.profile.company,
            last_updated_by: currentUser.id
          });
  
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error saving value:', error);
      setError('Failed to save value: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  useEffect(() => {
    debouncedCombinedTasks.forEach(task => {
      if (task.importedValue !== undefined) {
        saveTaskValue(task.id, task.importedValue);
      }
    });
  }, [debouncedCombinedTasks, saveTaskValue]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchOwnersForAllTasks = async () => {
      const ownersMap: { [key: number]: string[] } = {};
      for (const task of combinedTasks) {
        const owners = await fetchTaskOwners(task.id);
        ownersMap[task.id] = owners;
      }
      setTaskOwners(ownersMap);
      console.log('Task owners fetched:', ownersMap); // Add this log
    };

    if (combinedTasks.length > 0) {
      fetchOwnersForAllTasks();
    }
  }, [combinedTasks]);

  const handleAddOwner = async (taskId: number, ownerId: string) => {
    try {
      const task = combinedTasks.find(t => t.id === taskId);
      if (!task || !currentUser) return;

      // Check if the owner already exists for the task
      const { data: existingOwners, error: existingOwnersError } = await supabase
        .from('task_owners')
        .select('user_id')
        .eq('task_id', taskId)
        .eq('user_id', ownerId);

      if (existingOwnersError) throw existingOwnersError;
      if (existingOwners && existingOwners.length > 0) {
        toast({
          title: "Owner Already Assigned",
          description: "This owner is already assigned to the task.",
          duration: 3000,
          variant: "destructive",
        });
        return;
      }

      const { data: disclosureData, error: disclosureError } = await supabase
        .from('disclosures')
        .select('id')
        .eq('id', disclosureId)
        .single();

      if (disclosureError) throw disclosureError;

      const { data: datapointData, error: datapointError } = await supabase
        .from('data_points')
        .select('id')
        .eq('id', task.dataPointDetails.id)
        .single();

      if (datapointError) throw datapointError;

      const { error: insertError } = await supabase
        .from('task_owners')
        .insert({
          task_id: taskId,
          user_id: ownerId,
          company: currentUser.profile.company,
          disclosure_id: disclosureData.id,
          datapoint_id: datapointData.id,
        });

      if (insertError) throw insertError;

      setSelectedOwners(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), ownerId],
      }));
    } catch (error) {
      console.error('Error adding task owner:', error);
      setError('Failed to add task owner: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleRemoveOwner = async (taskId: number, ownerId: string) => {
    try {
      const { error } = await supabase
        .from('task_owners')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', ownerId);

      if (error) throw error;

      setSelectedOwners(prev => ({
        ...prev, 
        [taskId]: prev[taskId].filter(id => id !== ownerId),
      }));
    } catch (error) {
      console.error('Error removing task owner:', error);
      setError('Failed to remove task owner: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const fetchTaskOwners = async (taskId: number): Promise<string[]> => {
    const { data, error } = await supabase
      .from('task_owners')
      .select('user_id')
      .eq('task_id', taskId);
    if (error) {
      console.error('Error fetching task owners:', error.message);
      return [];
    }
    return data.map(item => item.user_id);
  };

  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [selectedTaskIdForModal, setSelectedTaskIdForModal] = useState<number | null>(null);

  const renderOwnerSelection = (taskId: number) => (
    <>
      <Button variant="outline" size="sm" onClick={() => {
        setSelectedTaskIdForModal(taskId);
        setShowOwnerModal(true);
      }}>
        Manage Owners
      </Button>
      <OwnerModal 
        isOpen={showOwnerModal} 
        onClose={() => setShowOwnerModal(false)} 
        taskId={selectedTaskIdForModal} 
        users={users} 
        selectedOwners={selectedOwners[selectedTaskIdForModal || 0] || []}
        onAddOwner={(ownerId) => handleAddOwner(selectedTaskIdForModal!, ownerId)}
        onRemoveOwner={(ownerId) => handleRemoveOwner(selectedTaskIdForModal!, ownerId)}
      />
    </>
  );

  const ImportDialog = () => {
    const [mappings, setMappings] = useState<{ [key: string]: string }>(suggestedMappings);
    const [applyToAll, setApplyToAll] = useState(true);

    const handleMapping = (importField: string, taskId: string) => {
      setMappings(prev => ({ ...prev, [importField]: taskId }));
    };

    return (
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Map Imported Data to Fields</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Imported Data Preview (First 5 Rows)</h3>
              {importedData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {Object.keys(importedData[0]).map(key => (
                          <th key={key} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importedData.slice(0, 5).map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Map to Fields</h3>
              {Object.keys(importedData[0] || {}).map(key => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                  <Select value={mappings[key]} onValueChange={(value) => handleMapping(key, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Map ${key} to...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {combinedTasks.map(task => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.dataPointDetails?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="flex items-center mb-4">
                <Checkbox
                  id="applyToAll"
                  checked={applyToAll}
                  onCheckedChange={(checked) => setApplyToAll(checked as boolean)}
                />
                <label htmlFor="applyToAll" className="ml-2 text-sm text-gray-700">
                  Apply to all rows (if unchecked, only first row will be imported)
                </label>
              </div>
            </div>
          </div>
          <Button onClick={() => processImportedData(mappings, applyToAll)}>Apply Mappings</Button>
        </DialogContent>
      </Dialog>
    );
    
    // New Avatar component
    const Avatar: React.FC<{ userId: string }> = ({ userId }) => {
      const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    
      useEffect(() => {
        const fetchAvatar = async () => {
          const profile = await getUserProfile(userId);
          setAvatarUrl(profile?.avatar_path || null);
        };
        fetchAvatar();
      }, [userId]);
    
      if (!avatarUrl) return null;
    
      return (
        <img
          src={avatarUrl}
          alt="Owner Avatar"
          className="w-8 h-8 rounded-full border border-gray-300"
        />
      );
    };
    
  };



const BATCH_SIZE = 20; // Define this constant at the top level

  const handleAutofillFromPolicy = async (taskId: number) => {
    if (!taskId || !currentUser) {
      toast({
        title: "Error",
        description: "User is not authenticated or task ID is missing",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    const userCompany = currentUser.profile.company;
    const sessionId = localStorage.getItem('sessionId') || Date.now().toString();
    const BUCKET_NAME = userCompany;
    const RETRY_LIMIT = 5;
    const RETRY_DELAY_MS = 5000;
    const chunkSize = 1000;
    const chunkOverlap = 30;

  const cohereApiKey = process.env.NEXT_PUBLIC_COHERE_API_KEY;
  const pdfCoApiKey = process.env.NEXT_PUBLIC_PDF_CO_API_KEY;

  if (!cohereApiKey || !pdfCoApiKey) {
    toast({
      title: "Error",
      description: "API keys are missing. Please check your environment variables.",
      duration: 3000,
      variant: "destructive",
    });
    return;
  }

  try {
    // Fetch policy files from the files table
    const { data: policyFiles, error: policyFilesError } = await supabase
      .from('files')
      .select('*')
      .eq('task_id', taskId)
      .eq('company', userCompany);

    if (policyFilesError) throw policyFilesError;

    if (!policyFiles || policyFiles.length === 0) {
      toast({
        title: "No Policy Files",
        description: "No policy files found for this task.",
        duration: 3000,
      });
      return;
    }

    toast({
      title: "Processing Files",
      description: `Processing ${policyFiles.length} policy file(s) for embeddings.`,
      duration: 3000,
    });

    for (const file of policyFiles) {
      const filePath = file.file_destination.replace(`${BUCKET_NAME}/`, '');
      
      // Check if the file has already been processed
      const { data: existingDocuments } = await supabase
        .from('policies')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', currentUser.id)
        .eq('metadata->>file_path', filePath)
        .limit(1);

      if (existingDocuments && existingDocuments.length > 0) {
        console.log(`Skipping file (already processed): ${filePath}`);
        continue;
      }

      // Get signed URL for the file
      const { data: signedUrlData } = await supabase
        .storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60);

      if (!signedUrlData) {
        console.error(`Failed to create signed URL for ${filePath}`);
        continue;
      }

      const signedUrl = signedUrlData.signedUrl;

      // Extract text from PDF
      const documentText = await extractTextFromPdf(signedUrl, pdfCoApiKey);

      if (documentText.trim() === '') {
        console.warn(`Document is empty: ${filePath}`);
        continue;
      }

      // Split document into chunks
      const splitParts = splitDocument(documentText, chunkSize, chunkOverlap);

      // Get embeddings for chunks
      const embeddings = await getEmbeddingsInBatches(splitParts, cohereApiKey);

      // Store embeddings and info in the database
      await storeEmbeddingsAndInfo(embeddings, file, filePath, sessionId, currentUser.id);

      console.log(`Successfully processed: ${filePath}`);
    }

    toast({
      title: "Processing Complete",
      description: "All policy files have been processed and embedded.",
      duration: 3000,
    });

    // Fetch documents with session ID
    const documents = await getDocumentsWithSessionId(sessionId, currentUser.id);
    if (documents.length === 0) {
      toast({
        title: "Error",
        description: "No documents found for the given session ID",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    // Summarize with Cohere
    const cohereResponse = await summarizeWithCohere(documents, cohereApiKey);
    if (!cohereResponse) return;

    // Update the task with the summary
    setCombinedTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, importedValue: cohereResponse.text } : task
      )
    );

    toast({
      title: "Success",
      description: "Policy summary generated successfully",
      duration: 3000,
    });

  } catch (error) {
    console.error('Error in policy file processing:', error);
    toast({
      title: "Error",
      description: "Failed to process policy files. Please try again.",
      duration: 3000,
      variant: "destructive",
    });
  }
};

// Helper functions

async function extractTextFromPdf(fileUrl: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/text-simple', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: fileUrl,
      inline: true,
      async: false
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to extract text from PDF: ${response.statusText}`);
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    const jsonResponse = await response.json();
    if (!jsonResponse.body) {
      throw new Error('Failed to extract text from PDF');
    }
    return jsonResponse.body;
  } else {
    const text = await response.text();
    if (!text) {
      throw new Error('Failed to extract text from PDF');
    }
    return text;
  }
}

function splitDocument(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    
    if (endIndex < text.length) {
      const possibleEndIndex = text.lastIndexOf('.', endIndex);
      if (possibleEndIndex > startIndex && possibleEndIndex < endIndex + 100) {
        endIndex = possibleEndIndex + 1;
      }
    }

    chunks.push(text.substring(startIndex, endIndex).trim());
    startIndex = endIndex - chunkOverlap;
  }

  return chunks;
}

async function getEmbeddingsInBatches(parts: string[], apiKey: string): Promise<{ part: string; embedding: number[] }[]> {
  const batches = [];
  for (let i = 0; i < parts.length; i += BATCH_SIZE) {
    batches.push(parts.slice(i, i + BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map(async (batch) => {
      const response = await fetch('https://api.cohere.ai/embed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texts: batch,
          model: 'embed-english-v3.0',
          input_type: 'search_document'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch embedding: ${response.statusText}`);
      }

      const responseBody = await response.json();
      if (!responseBody.embeddings || responseBody.embeddings.length === 0) {
        throw new Error('No embeddings returned from Cohere');
      }

      return batch.map((part, index) => ({
        part,
        embedding: responseBody.embeddings[index]
      }));
    })
  );

  return results.flat();
}

async function storeEmbeddingsAndInfo(
  embeddings: { part: string; embedding: number[] }[],
  fileInfo: any,
  filePath: string,
  sessionId: string,
  userId: string
) {
  const results = await Promise.all(
    embeddings.map(async ({ part, embedding }, index) => {
      const { data, error } = await supabase
        .from('policies')
        .insert([{ 
          content: part, 
          embedding, 
          metadata: {
            ...fileInfo,
            chunk_index: index,
            total_chunks: embeddings.length,
            file_path: filePath
          },
          session_id: sessionId,
          user_id: userId,
          uploaded_at: new Date().toISOString()
        }]);

      if (error) {
        throw new Error(`Supabase Insert Error: ${error.message}`);
      }

      return data;
    })
  );
  return results;
}

async function getDocumentsWithSessionId(sessionId: string, userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('content')
      .eq('session_id', sessionId)
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(doc => doc.content);
  } catch (error) {
    toast({
      title: "Error",
      description: `Error fetching documents: ${error instanceof Error ? error.message : String(error)}`,
      duration: 3000,
      variant: "destructive",
    });
    return [];
  }
}

async function summarizeWithCohere(documents: string[], apiKey: string) {
  try {
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `## Task & Context
You are an AI assistant helping companies create ESRS-compliant policy summaries. Based on the provided policy document, generate a concise and informative policy summary that addresses all the following MDR-P data points in a cohesive narrative, without using bullet points:

* **65 a) Description of key contents of policy:**  Provide a clear overview of the policy's main content, including its specific objectives, quantifiable targets or goals, and how it addresses the relevant material impacts, risks, or opportunities. 
* **65 b) Description of scope of policy or of its exclusions:**  Define the scope of the policy, specifying the activities, parts of the value chain, and geographical areas it covers. If the policy does not explicitly state any exclusions, mention this and highlight the areas of focus based on the policy's content. 
* **65 c) Description of the most senior level in the organization that is accountable for implementation of policy:**  Identify the position or body with ultimate responsibility for the policy's implementation and oversight. 
* **65 d) Disclosure of third-party standards or initiatives that are respected through implementation of policy:**  List any relevant third-party standards, certifications, or initiatives that the policy is aligned with. 
* **65 e) Description of consideration given to interests of key stakeholders in setting policy:** Explain how the policy considered the interests of relevant stakeholder groups during its development.  Include specific examples of stakeholder groups consulted and the engagement methods used. 
* **65 f) Explanation of how policy is made available to potentially affected stakeholders and stakeholders who need to help implement it:** Describe how the company makes the policy accessible to relevant stakeholders. Provide specific examples of communication channels or methods used.

## Style and Tone:
* Use clear and concise language, avoiding jargon.
* Maintain a professional and objective tone.
* Ensure the summary is grammatically correct and easy to read. 
`,
        model: "command-r",
        documents: documents.map((text, index) => ({ id: `doc_${index}`, text: text }))
      })
    });
    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Cohere API error: ${response.status} ${responseText}`);
    }
    return await response.json();
  } catch (error) {
    toast({
      title: "Error",
      description: `Error querying Cohere API: ${error instanceof Error ? error.message : String(error)}`,
      duration: 3000,
      variant: "destructive",
    });
    return null;
  }
}

const uploadFile = async (file: File, taskId: number) => {
  if (!currentUser) return;

    const companyName = currentUser.profile.company;

    try {
      // Get the disclosure reference
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('disclosure')
        .eq('id', taskId)
        .single();

      if (taskError) throw new Error('Error fetching disclosure from tasks.');
      if (!taskData) throw new Error('Task not found.');

      const { data: disclosureData, error: disclosureError } = await supabase
        .from('disclosures')
        .select('reference')
        .eq('id', taskData.disclosure)
        .single();

      if (disclosureError) throw new Error('Error fetching disclosure reference.');
      if (!disclosureData) throw new Error('Disclosure not found.');

      const disclosureReference = disclosureData.reference;

      // Check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) throw new Error('Error listing buckets.');

      const bucketExists = buckets.some(bucket => bucket.id === companyName);

      // If the bucket doesn't exist, try to create it
      if (!bucketExists) {
        try {
          const { error: createError } = await supabase.storage.createBucket(companyName, {
            public: false
          });
          if (createError) throw new Error(`Error creating bucket: ${createError.message}`);
        } catch (createBucketError) {
          console.warn('Unable to create bucket. Attempting to upload file to existing storage.');
        }
      }

      // Define the file path
      const filePath = `${disclosureReference}/${taskId}/${file.name}`;

          // Upload the file
    const { error: uploadError } = await supabase.storage
    .from(companyName)
    .upload(filePath, file);

  if (uploadError) throw new Error(`Error uploading file: ${uploadError.message}`);

  // Insert file details into the database
  const { data: fileData, error: insertError } = await supabase
    .from('files')
    .insert({
      file_name: file.name,
      file_destination: `${companyName}/${filePath}`,
      task_id: taskId,
      uploaded_by: currentUser.id,
      company: companyName
    })
    .select()
    .single();

  if (insertError) throw new Error(`Error inserting file details: ${insertError.message}`);

  // Update local state
  setFiles(prevFiles => [...prevFiles, fileData]);

  // You might want to show a success message here
  console.log('File uploaded and recorded successfully.');

} catch (error) {
  console.error('Error uploading file:', error instanceof Error ? error.message : 'Unknown error');
  setError('Failed to upload file: ' + (error instanceof Error ? error.message : String(error)));
}
};

  const renderCardContent = () => {
    const activeTask = combinedTasks.find(task => task.id === activeTaskId);
    
    switch (activeCard) {
      case 'chat':
        return (
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              {messages.map((message) => renderMessage(message))}
            </ScrollArea>
            <div className="mt-4">
              {replyingToId && (
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2 flex justify-between items-center">
                  <p className="text-sm">
                    Replying to: {messages.find((m: Message) => m.id === replyingToId)?.message.substring(0, 50)}...
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setReplyingToId(null)}>
                    <FaTimes />
                  </Button>
                </div>
              )}
              <Textarea 
                placeholder="Type your message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                className="mt-2 w-full" 
                onClick={() => {
                  sendMessage(activeTaskId!, replyingToId);
                  setReplyingToId(null);
                }}
              >
                Send
              </Button>
            </div>
          </div>
        );
        case 'files':
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 pr-4">
      {files.map((file) => (
  <div key={file.id} className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-start justify-between group">
    <div className="flex items-start flex-grow mr-2">
      <FaPaperclip className="mr-2 text-blue-500 flex-shrink-0 mt-1" />
      <div className="max-w-[130px] break-words">
        <span 
          className="text-blue-500 hover:underline cursor-pointer" 
          onClick={() => viewFile(file.file_destination)}
        >
          {file.file_name}
        </span>
      </div>
    </div>
            <div className="flex-shrink-0 flex space-x-2 ml-2">
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={() => viewFile(file.file_destination)}>
                <FaEye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={() => deleteFile(file.id, file.file_destination)}>
                <FaTrash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
            <FaUpload className="mx-auto mb-2" />
            <p>Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">PDF, DOCX, XLSX, JPG, PNG (max. 10MB)</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] as BrowserFile | undefined;
              if (file && currentUser && activeTaskId) {
                uploadFile(file, activeTaskId);
              }
            }}
            accept=".pdf,.docx,.xlsx,.jpg,.png"
          />
        </label>
      </div>
    </div>
  );
      case 'ai':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {aiMessages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'assistant' ? 'bg-blue-50 dark:bg-blue-900 p-3 rounded-lg' : ''}`}>
                  <strong>{message.role === 'assistant' ? 'Vera: ' : 'You: '}</strong>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Input
                placeholder="Ask Vera..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <Button className="mt-2 w-full" onClick={sendVeraMessage} disabled={isVeraLoading}>
                {isVeraLoading ? 'Thinking...' : 'Send'}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF8FF] dark:bg-gray-900 text-[#1F2937] dark:text-gray-100 text-base font-poppins flex flex-col">
      <div className="p-8 pl-12 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center text-[#1F2937] dark:text-gray-100 hover:text-[#3B82F6] dark:hover:text-[#3B82F6]"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </Button>
        <ModeToggle />
      </div>

      <div className="flex-grow flex overflow-hidden pl-12 pr-12">
        <div className="w-full overflow-y-auto pr-[520px]">
          {error && <p className="text-red-500 mb-4 max-w-[450px]">{error}</p>}

          <div className="mb-4 flex justify-end">
            <Button
              onClick={handleImportData}
              className="flex items-center bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors duration-200"
            >
              <FaUpload className="mr-2" />
              Import Data
            </Button>
          </div>

          {combinedTasks.map(task => (
  <div key={task.id} className="mb-10 transition-all duration-300 transform">
    <div className="rounded-lg overflow-hidden transition-all duration-300 bg-transparent">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-[1.25rem] font-semibold text-[#1F2937] flex-grow pr-4">
              {task.dataPointDetails?.name}
            </h2>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2 overflow-hidden w-[110px] h-[50px] items-center">
                {taskOwners[task.id]?.map((ownerId, index) => (
                  <Avatar key={ownerId} className="w-10 h-10 border-2 border-white dark:border-gray-800">
                    <AvatarImage src={ownersAvatars[ownerId]} alt={`Owner ${index + 1}`} />
                  </Avatar>
                ))}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">Assign Owner</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {users.map(user => (
                    <DropdownMenuItem
                      key={user.id}
                      onSelect={() => handleAddOwner(task.id, user.id)}
                    >
                      {user.firstname} {user.lastname}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex space-x-2 mb-2">
              <span className="px-3 py-1 bg-transparent border border-[#71A1FC] text-[#1F2937] rounded-full text-xs font-light">
                {task.dataPointDetails?.paragraph}
              </span>
              <span className="px-3 py-1 bg-transparent border border-[#71A1FC] text-[#1F2937] rounded-full text-xs font-light">
                {task.dataPointDetails?.data_type}
              </span>
            </div>
            <div className="flex items-center justify-between w-[345px] h-[40px] px-4 bg-transparent border border-gray-600 dark:border-gray-400 rounded-full">
              <div className="flex items-center">
                <Switch id={`done-${task.id}`} />
                <label htmlFor={`done-${task.id}`} className="text-sm font-light text-[#1F2937] dark:text-gray-300 ml-2">Done</label>
              </div>
              <div className="flex items-center space-x-6">
                <FaRobot 
                  className="text-[#1F2937] dark:text-gray-300 cursor-pointer" 
                  title="Vera AI" 
                  onClick={() => handleCardOpen('ai', task.id)}
                />
                <FaPaperclip 
                  className="text-[#1F2937] dark:text-gray-300 cursor-pointer" 
                  title="Attach File" 
                  onClick={() => handleCardOpen('files', task.id)}
                />
                <FaComments 
                  className="text-[#1F2937] dark:text-gray-300 cursor-pointer" 
                  title="Chat" 
                  onClick={() => handleCardOpen('chat', task.id)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <Textarea
            id={`datapoint-${task.id}`}
            placeholder="Enter data point value"
            className="min-h-[200px] bg-transparent border border-gray-600 dark:border-gray-400 w-full text-[#1F2937] dark:text-gray-100 font-light rounded-md"
            value={task.importedValue || ''}
            onChange={(e) => {
              const updatedTasks = combinedTasks.map(t => 
                t.id === task.id ? { ...t, importedValue: e.target.value } : t
              );
              setCombinedTasks(updatedTasks);
            }}
            onBlur={() => {
              if (task.importedValue !== undefined) {
                saveTaskValue(task.id, task.importedValue);
              }
            }}
          />
        </div>
        {task.dataPointDetails?.data_type === "MDR-P" && (
          <Button 
            onClick={() => handleAutofillFromPolicy(task.id)}
            className="mt-2 bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors duration-200"
          >
            Autofill from a policy
          </Button>
        )}
      </div>
            </div>
            </div>
          ))} 

          {combinedTasks.length === 0 && (
            <p className="text-[#1F2937] max-w-[450px]">No data points found for this disclosure.</p>
          )}
        </div>

        {/* Side Card */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-[500px] h-[90vh] bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex flex-col rounded-[20px] transition-all duration-300">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">
              {activeCard === 'chat' ? 'Chat' : activeCard === 'files' ? 'Files' : 'Vera AI'}
            </h2>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveCard('chat')}>
                <FaComments />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveCard('files')}>
                <FaPaperclip />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveCard('ai')}>
                <FaRobot />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeTaskId ? (
              renderCardContent()
            ) : (
              <p className="text-center text-gray-500 mt-4">Select a task to view details</p>
            )}
          </div>
        </div>
      </div>

      <ImportDialog />
    </div>
  );
}

export default withAuth(DisclosureDetailsPage);
interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
  users: any[];
  selectedOwners: string[];
  onAddOwner: (ownerId: string) => void;
  onRemoveOwner: (ownerId: string) => void;
}

const OwnerModal: React.FC<OwnerModalProps> = ({ isOpen, onClose, taskId, users, selectedOwners, onAddOwner, onRemoveOwner }) => {
  if (!isOpen || !taskId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Owners for Task {taskId}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Add Owner</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Add Owner</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {users.map(user => (
                <DropdownMenuItem 
                  key={user.id}
                  onSelect={() => onAddOwner(user.id)}
                >
                  {user.firstname} {user.lastname}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Current Owners</h3>
          {selectedOwners.map(ownerId => {
            const owner = users.find(user => user.id === ownerId);
            return (
              <div key={ownerId} className="flex justify-between items-center mb-2">
                <span>{owner?.firstname} {owner?.lastname}</span>
                <Button variant="outline" size="sm" onClick={() => onRemoveOwner(ownerId)}>
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
