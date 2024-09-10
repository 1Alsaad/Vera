'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { Database } from '../../../types/supabase';
import Link from 'next/link';
import { withAuth } from '../../../components/withAuth';
import { FaRobot, FaPaperclip, FaComments, FaEye, FaArrowLeft, FaEllipsisV, FaReply, FaUpload, FaTimes, FaTrash } from 'react-icons/fa';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

type Task = Database['public']['Tables']['tasks']['Row'];
type DataPoint = Database['public']['Tables']['data_points']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type File = Database['public']['Tables']['files']['Row'];

interface CombinedTask extends Task {
  dataPointDetails: DataPoint;
  importedValue?: string;
  messages?: Message[];
  files?: File[];
}

type BrowserFile = File;

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
    if (!currentUser) return;

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

      const combined: CombinedTask[] = await Promise.all(tasks.map(async task => {
        const dataPointDetails = dataPoints.find(dp => dp.id === task.datapoint) || null;
        
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
  };

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
      console.error('Error uploading file:', error);
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