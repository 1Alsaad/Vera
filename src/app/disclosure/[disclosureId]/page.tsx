'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../types/supabase';
import Link from 'next/link';
import { withAuth } from '../../../components/withAuth';
import { FaRobot, FaPaperclip, FaComments, FaEye, FaArrowLeft, FaEllipsisV, FaReply, FaUpload, FaTimes, FaTrash, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import AvatarCircles from "@/components/magicui/avatar-circles";
import { debounce } from 'lodash';
import { PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const supabaseUrl = 'https://tmmmdyykqbowfywwrwvg.supabase.co';

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey!);

type Task = Database['public']['Tables']['tasks']['Row'];
type DataPoint = Database['public']['Tables']['data_points']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type File = Database['public']['Tables']['files']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];



interface CombinedTask extends Task {
  dataPointDetails: DataPoint;
  importedValue?: string;
  messages?: Message[];
  files?: File[];
  owners: Profile[]; // Initialize as an empty array
}


type BrowserFile = File;

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
  const [activeCard, setActiveCard] = useState<'chat' | 'files' | 'ai' | 'table' | 'table-edit'>('chat');
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVeraLoading, setIsVeraLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const { toast } = useToast();
  const [showManageOwnersDialog, setShowManageOwnersDialog] = useState<{ taskId: number | null, show: boolean }>({ taskId: null, show: false });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [allCompanyUsers, setAllCompanyUsers] = useState<Profile[]>([]);
  const [taskOwners, setTaskOwners] = useState<Profile[]>([]);
  const [taskAvatarUrls, setTaskAvatarUrls] = useState<{ [taskId: number]: string[] }>({});
  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  const [tableColumns, setTableColumns] = useState<string[]>(['']);
// Add these new state variables
const [editingTable, setEditingTable] = useState(false);
const [tableRows, setTableRows] = useState<string[][]>([['']]);
const [isTableExpanded, setIsTableExpanded] = useState(false);


  const handleOpenManageOwnersDialog = async (event: React.MouseEvent, taskId: number) => {
    event.preventDefault(); // Prevent the default action
    event.stopPropagation(); // Stop the event from bubbling up
    setShowManageOwnersDialog({ taskId, show: true });
    await fetchTaskOwners(taskId);
  };

  const handleCloseManageOwnersDialog = () => {
    setShowManageOwnersDialog({ taskId: null, show: false });
    setSelectedUserIds([]);
    setTaskOwners([]);
  };

  const getAvatarURLs = useCallback(async (taskId: number) => {
    if (!currentUser || !currentUser.profile) return;

    try {
      // Get user IDs from task_owners table
      const { data: userIds, error: userIdsError } = await supabase
        .from('task_owners')
        .select('user_id')
        .eq('task_id', taskId);

      if (userIdsError) throw userIdsError;

      // Get user profiles from profiles table
      const userProfiles = await Promise.all(
        userIds.map(async ({ user_id }) => {
          const { data, error } = await supabase
            .from('profiles')
            .select('firstname, lastname, company')
            .eq('id', user_id)
            .single();

          if (error) throw error;
          return data;
        })
      );

      // Construct the file paths
      const filePaths = userProfiles.map(profile => {
        const { firstname, lastname } = profile;
        const fullName = `${firstname} ${lastname}`;
        return `avatars/${fullName}.png`;
      });

      // Generate the signed URLs for the avatars
      const expiresIn = 60; // URLs expire in 60 seconds
      const { data: signedUrlsData, error: signedUrlsError } = await supabase
        .storage
        .from(currentUser.profile.company)
        .createSignedUrls(filePaths, expiresIn);

      if (signedUrlsError) throw signedUrlsError;

      const avatarSignedURLs = signedUrlsData.map(item => item.signedUrl);

      setTaskAvatarUrls(prev => ({ ...prev, [taskId]: avatarSignedURLs }));
    } catch (error) {
      console.error('Error fetching avatar URLs:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (combinedTasks.length > 0) {
      combinedTasks.forEach(task => getAvatarURLs(task.id));
    }
  }, [combinedTasks, getAvatarURLs]);

  const fetchTaskOwners = async (taskId: number) => {
    if (!currentUser || !currentUser.profile) return;
  
    try {
      const { data, error } = await supabase
        .from('task_owners')
        .select('user_id')
        .eq('task_id', taskId)
        .eq('company', currentUser.profile.company);
  
      if (error) throw error;
  
      const ownerIds = data.map(item => item.user_id);
      const owners = allCompanyUsers.filter(user => ownerIds.includes(user.id));
      setTaskOwners(owners);
    } catch (error) {
      console.error('Error fetching task owners:', error);
      setError('Failed to fetch task owners');
    }
  };

  const saveReportingData = async (taskId: number, sectionText: string, disclosure: string, datapoint: number) => {
    if (!currentUser || !currentUser.profile) {
      console.error("Current user or profile not available");
      return;
    }

    const company = currentUser.profile.company;
    const lastUpdatedBy = currentUser.id;
    const lastUpdated = new Date().toISOString();

    try {
      const { data: existingRecord, error: checkError } = await supabase
        .from('reporting_data')
        .select('*')
        .eq('task_id', taskId)
        .eq('company', company)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRecord) {
        const { error: updateError } = await supabase
          .from('reporting_data')
          .update({
            value: sectionText,
            disclosure: disclosure,
            datapoint: datapoint,
            last_updated_by: lastUpdatedBy,
            last_updated: lastUpdated
          })
          .eq('task_id', taskId)
          .eq('company', company);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('reporting_data')
          .insert({
            value: sectionText,
            disclosure: disclosure,
            datapoint: datapoint,
            task_id: taskId,
            company: company,
            last_updated_by: lastUpdatedBy,
            last_updated: lastUpdated
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Data saved successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving reporting data:', error);
      toast({
        title: "Error",
        description: "Failed to save data",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const debouncedSaveReportingData = debounce(saveReportingData, 1000);

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
                 
        // Fetch reporting data for this task
        const { data: reportingData, error: reportingDataError } = await supabase
          .from('reporting_data')
          .select('value')
          .eq('task_id', task.id)
          .single();

        if (reportingDataError) {
          console.error('Error fetching reporting data:', reportingDataError.message);
        }

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

        return {
          ...task,
          dataPointDetails,
          importedValue: reportingData?.value || '',
          messages,
          files,
          owners: (task as any).owners || [] // Initialize owners as an empty array if not present
        };
      }));




      setCombinedTasks(combined);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [currentUser, disclosureId, supabase]);

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

  // Fetch tasks, data points, and owner avatars when the component mounts
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

  // Modify the handleCardOpen function
const handleCardOpen = (type: 'chat' | 'files' | 'ai' | 'table', taskId: number) => {
  setActiveTaskId(taskId);
  setActiveCard(type);

  if (type === 'chat') {
    fetchMessages(taskId);
  } else if (type === 'files') {
    fetchFiles(taskId);
  } else if (type === 'ai') {
    setAiMessages([]);
  } else if (type === 'table') {
    fetchTableData(taskId);
    setIsTableExpanded(true);
  }
};

// Add this function to close the expanded table view
const closeExpandedTable = () => {
  setIsTableExpanded(false);
  setActiveCard('chat');
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

// Add this helper function to check if the data type includes 'table'
const isTableDataType = (dataType: string | undefined) => {
  return dataType?.toLowerCase().includes('table');
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
  };

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

  };

  // Function to fetch all users in the company
useEffect(() => {
  const fetchUsers = async () => {
    if (currentUser && currentUser.profile) {
      try {
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, firstname, lastname, has_avatar, company, email, updated_at, user_role')
          .eq('company', currentUser.profile.company);


        if (error) {
          console.error('Error fetching users:', error);
          setError('Failed to fetch users');
        } else {
          setAllCompanyUsers(users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
      }
    }
  };

  fetchUsers();
}, [currentUser]);


// Function to insert task owners (adapted from Noodl code)
const insertTaskOwners = async (userIds: string[], taskId: number) => {
  if (!currentUser || !currentUser.profile || !currentUser.profile.company) {
    setError('Missing user information.');
    return;
  }

  const company = currentUser.profile.company;
  const datapointId = combinedTasks.find(t => t.id === taskId)?.datapoint;

  if (!taskId || userIds.length === 0 || !disclosureId || !datapointId) {
    setError("Missing required input values.");
    return;
  }

  try {

    // Filter out users that are already owners
    const existingOwnerIds = combinedTasks.find(t => t.id === taskId)?.owners.map(o => o.id) || [];
    const newUserIds = userIds.filter(id => !existingOwnerIds.includes(id));

    if (newUserIds.length === 0) {
      toast({
        title: "Info",
        description: "All selected users are already owners of this task.",
        duration: 3000,
      });
      return;
    }

    // Check if the task exists
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .limit(1);

    if (taskError) {
      setError(`Error checking task existence: ${taskError.message}`);
      return;
    }

    if (taskData.length === 0) {
      setError(`Task with ID ${taskId} does not exist.`);
      return;
    }

    // Insert data into 'task_owners'
    const insertData = newUserIds.map(userId => ({
      task_id: taskId,
      user_id: userId,
      company: company,
      disclosure_id: disclosureId,
      datapoint_id: datapointId
    }));

    const { error: insertError } = await supabase
      .from('task_owners')
      .insert(insertData);

    if (insertError) {
      setError(`Error inserting task owners: ${insertError.message}`);
      return;
    }

    // Update the combinedTasks state with new owners
    setCombinedTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              owners: [
                ...task.owners, 
                ...allCompanyUsers.filter(user => newUserIds.includes(user.id))
              ] 
            } 
          : task
      )
    );

    toast({
      title: "Success",
      description: "Task owners added successfully",
      duration: 3000,
    });

  } catch (error) {
    setError(`Unexpected error inserting task owners: ${error instanceof Error ? error.message : String(error)}`);
  }
};


// Function to remove a task owner (adapted from Noodl code)
const removeTaskOwner = async (userId: string, taskId: number) => {
  if (!currentUser || !currentUser.profile || !currentUser.profile.company) {
    setError('Missing user information.');
    return;
  }

  const company = currentUser.profile.company;

  try {
    const { error } = await supabase
      .from('task_owners')
      .delete()
      .eq('company', company)
      .eq('task_id', taskId)
      .eq('user_id', userId);

    if (error) {
      setError(`Error removing task owner: ${error.message}`);
      return;
    }

    // Update the combinedTasks state to remove the owner
    setCombinedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, owners: task.owners.filter(owner => owner.id !== userId) }
          : task
      )
    );

  } catch (error) {
    setError(`Unexpected error removing task owner: ${error instanceof Error ? error.message : String(error)}`);
  }
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

  const uploadFile = async (file: BrowserFile, taskId: number) => {
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
        .upload(filePath, file as File);

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
      console.error('Error uploading file:', error);
      setError('Failed to upload file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Add this function to create a table
  const createTableForTask = async (taskId: number) => {
    if (!currentUser || !currentUser.profile) return;

    try {
      const tableName = `Task_${taskId}_Table`;
      
      // Insert into disclosure_tables
      const { data: tableData, error: tableError } = await supabase
        .from('disclosure_tables')
        .insert({
          table_name: tableName,
          task_id: taskId,
          belongs_to: currentUser.profile.company,
          created_by: currentUser.id
        })
        .select()
        .single();

      if (tableError) throw tableError;

      // Insert columns
      const columnInserts = tableColumns.map((columnName, index) => ({
        table_id: tableData.id,
        column_name: columnName,
        order_index: index.toString(),
        belongs_to: currentUser.profile.company
      }));

      const { error: columnError } = await supabase
        .from('table_columns')
        .insert(columnInserts);

      if (columnError) throw columnError;

      toast({
        title: "Success",
        description: "Table created successfully",
        duration: 3000,
      });

      setShowCreateTableDialog(false);
      setTableColumns(['']);
    } catch (error) {
      console.error('Error creating table:', error);
      toast({
        title: "Error",
        description: "Failed to create table",
        duration: 3000,
        variant: "destructive",
      });
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
        case 'table':
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Table Data</h3>
      {tableData ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {tableData.columns.map((column: any) => (
                  <th key={column.id} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.column_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(tableData.rows) ? tableData.rows.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {tableData.columns.map((column: any) => (
                    <td key={`${rowIndex}-${column.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row[column.id] || ''}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={tableData.columns.length} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No table data available.</p>
      )}
      <Button 
        onClick={() => setShowCreateTableDialog(true)}
        className="mt-4"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Create/Edit Table
      </Button>
    </div>
  );
      }
    };


  // Add this dialog component for creating tables
  const CreateTableDialog = () => (
    <Dialog open={showCreateTableDialog} onOpenChange={setShowCreateTableDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Table</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {tableColumns.map((column, index) => (
            <Input
              key={index}
              value={column}
              onChange={(e) => {
                const newColumns = [...tableColumns];
                newColumns[index] = e.target.value;
                setTableColumns(newColumns);
              }}
              placeholder={`Column ${index + 1} name`}
            />
          ))}
          <Button onClick={() => setTableColumns([...tableColumns, ''])}>
            Add Column
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => createTableForTask(activeTaskId!)}>Create Table</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Add this function to fetch table data
  const fetchTableData = async (taskId: number) => {
    if (!currentUser || !currentUser.profile) return;
  
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('disclosure_tables')
        .select('*')
        .eq('task_id', taskId)
        .eq('belongs_to', currentUser.profile.company)
        .single();
  
      if (tableError) throw tableError;
  
      if (tableInfo) {
        const { data: columns, error: columnError } = await supabase
          .from('table_columns')
          .select('*')
          .eq('table_id', tableInfo.id)
          .order('order_index', { ascending: true });
  
        if (columnError) throw columnError;
  
        const { data: cellData, error: cellError } = await supabase
          .from('table_data')
          .select('*')
          .eq('table_id', tableInfo.id)
          .eq('belongs_to', currentUser.profile.company)
          .order('order_index', { ascending: true });
  
        if (cellError) throw cellError;
  
        const rows = cellData.reduce((acc: { [key: string]: string }[], cell: any) => {
          const rowIndex = Math.floor(cell.order_index / columns.length);
          if (!acc[rowIndex]) acc[rowIndex] = {};
          acc[rowIndex][cell.column_id] = cell.cell_value;
          return acc;
        }, []);
  
        setTableColumns(columns);
        setTableRows(rows);
        setTableData({ tableInfo, columns, rows });
      } else {
        setTableColumns([]);
        setTableRows([]);
        setTableData(null);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      setError('Failed to fetch table data');
    }
  };

  // Add these new functions to handle table editing
  const addColumn = () => {
    setTableColumns([...tableColumns, '']);
    setTableRows(rows => rows.map(row => [...row, '']));
  };

  const removeColumn = (index: number) => {
    setTableColumns(columns => columns.filter((_, i) => i !== index));
    setTableRows(rows => rows.map(row => row.filter((_, i) => i !== index)));
  };

  const addRow = () => {
    setTableRows([...tableRows, new Array(tableColumns.length).fill('')]);
  };

  const removeRow = (index: number) => {
    setTableRows(rows => rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setTableRows(rows => 
      rows.map((row, i) => 
        i === rowIndex ? row.map((cell, j) => j === colIndex ? value : cell) : row
      )
    );
  };

  const saveTable = async () => {
    if (!currentUser || !currentUser.profile || !tableData) return;

    try {
      // Update or insert columns
      const columnPromises = tableColumns.map((colName, index) => 
        supabase.from('table_columns').upsert({
          table_id: tableData.tableInfo.id,
          column_name: colName,
          order_index: index,
          belongs_to: currentUser.profile.company
        })
      );
      await Promise.all(columnPromises);

      // Update or insert cell data
      const cellPromises = tableRows.flatMap((row, rowIndex) => 
        row.map((cellValue, colIndex) => 
          supabase.from('table_data').upsert({
            table_id: tableData.tableInfo.id,
            cell_value: cellValue,
            order_index: rowIndex * tableColumns.length + colIndex,
            belongs_to: currentUser.profile.company,
            column_id: tableData.columns[colIndex].id
          })
        )
      );
      await Promise.all(cellPromises);

      setEditingTable(false);
      toast({
        title: "Success",
        description: "Table data saved successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving table data:', error);
      setError('Failed to save table data');
    }
  };
  
  // Update the state type to match the new structure
  const [tableData, setTableData] = useState<{ 
    tableInfo: any, 
    columns: any[], 
    rows: any[][] 
  } | null>(null);

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
        <div className="w-full overflow-y-auto pr-[520px]"> {/* Adjusted padding to account for 500px sidebar */}
          {error && <p className="text-red-500 mb-4 max-w-[450px]">{error}</p>}
  
          {combinedTasks.map(task => (
            <div key={task.id} className="mb-10 transition-all duration-300 transform">
              <div className="rounded-lg overflow-hidden transition-all duration-300 bg-transparent">
              <div className="p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[1.25rem] font-semibold text-[#1F2937] flex-grow pr-4">
      {task.dataPointDetails?.name}
    </h2>
  </div>

  <div className="flex items-center justify-between mb-4 space-x-4">
    <div className="flex items-center space-x-2">
      <span className="px-3 py-1 bg-transparent border border-[#71A1FC] text-[#1F2937] rounded-full text-xs font-light">
        {task.dataPointDetails?.paragraph}
      </span>
      <span className="px-3 py-1 bg-transparent border border-[#71A1FC] text-[#1F2937] rounded-full text-xs font-light">
        {task.dataPointDetails?.data_type}
      </span>
    </div>

    <div 
      onClick={(e) => handleOpenManageOwnersDialog(e, task.id)} 
      className="cursor-pointer flex items-center"
    >
      <AvatarCircles
        avatarUrls={taskAvatarUrls[task.id] || []}
        numPeople={task.owners.length > 3 ? task.owners.length - 3 : 0}
      />
    </div>

    <div className="flex items-center justify-between w-[345px] h-[40px] px-4 bg-transparent border border-gray-600 dark:border-gray-400 rounded-full">
  <div className="flex items-center">
    <Switch id={`done-${task.id}`} />
    <label htmlFor={`done-${task.id}`} className="text-sm font-light text-[#1F2937] dark:text-gray-300 ml-2">Done</label>
  </div>
  <div className="flex items-center justify-between w-[200px] ml-4">
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
    {isTableDataType(task.dataPointDetails?.data_type ?? '') && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCardOpen('table', task.id)}
        className="p-1 h-8 w-8"
        title="Manage Table"
      >
        <PlusCircle className="h-4 w-4" />
      </Button>
    )}
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
        debouncedSaveReportingData(task.id, e.target.value, disclosureId!, task.datapoint);
      }}
      onBlur={() => {
        debouncedSaveReportingData.flush();
      }}
    />
  </div>
</div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Sidebar */}
        <AnimatePresence>
        <motion.div 
          className={`fixed right-0 top-0 h-screen bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex flex-col transition-all duration-1000 ${isTableExpanded ? 'w-full' : 'w-[500px]'}`}
          initial={{ width: isTableExpanded ? "100%" : "500px" }}
          animate={{ width: isTableExpanded ? "100%" : "500px" }}
          transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {activeCard === 'chat' ? 'Chat' : activeCard === 'files' ? 'Files' : activeCard === 'ai' ? 'Vera AI' : 'Table'}
              </h2>
              <div className="flex space-x-2">
                {!isTableExpanded && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setActiveCard('chat')}>
                      <FaComments />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveCard('files')}>
                      <FaPaperclip />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveCard('ai')}>
                      <FaRobot />
                    </Button>
                  </>
                )}
                {isTableExpanded && (
                  <Button variant="ghost" size="sm" onClick={closeExpandedTable}>
                    <FaTimes />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activeTaskId ? (
                renderCardContent()
              ) : (
                <p className="text-center text-gray-500 mt-4">Select a task to view details</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
  
      {/* Manage Owners Dialog */}
  <Dialog open={showManageOwnersDialog.show} onOpenChange={handleCloseManageOwnersDialog}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Manage Task Owners</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <h3 className="font-medium text-lg mb-2">Current Owners:</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {taskOwners.map(owner => (
            <div key={owner.id} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
              <span className="mr-2">{owner.firstname} {owner.lastname}</span>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-1 h-6 w-6"
                onClick={() => removeTaskOwner(owner.id, showManageOwnersDialog.taskId!)}
              >
                <FaTimes className="w-3 h-3" />
              </Button>
            </div>
              ))}
            </div>  

            <h3 className="font-medium text-lg mb-2">Add Owners:</h3>
        <div className="max-h-60 overflow-y-auto">
          {allCompanyUsers
            .filter(user => !taskOwners.some(owner => owner.id === user.id))
            .map(user => (
              <div key={user.id} className="flex items-center mb-2">
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUserIds.includes(user.id)}
                  onCheckedChange={(checked) => {
                    setSelectedUserIds(prev => 
                      checked 
                        ? [...prev, user.id]
                        : prev.filter(id => id !== user.id)
                    );
                  }}
                />
                <label htmlFor={`user-${user.id}`} className="ml-2">
                  {user.firstname} {user.lastname}
                </label>
              </div>
            ))}
        </div>
        <Button
          className="mt-4 w-full"
          disabled={selectedUserIds.length === 0}
          onClick={() => {
            if (selectedUserIds.length > 0 && showManageOwnersDialog.taskId) {
              insertTaskOwners(selectedUserIds, showManageOwnersDialog.taskId);
              setSelectedUserIds([]);
              handleCloseManageOwnersDialog();
            }
          }}
        >
          Add Selected Owners
        </Button>
      </div>
    </DialogContent>
      </Dialog>

      <ImportDialog />
    </div>
  );   

 }
export default withAuth(DisclosureDetailsPage); 