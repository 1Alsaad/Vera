'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import { withAuth } from '../../../components/withAuth';
import { FaRobot, FaPaperclip, FaComments, FaDownload, FaArrowLeft, FaEllipsisV, FaReply, FaUpload } from 'react-icons/fa';
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
import { createNotification } from '../../../lib/notificationHelpers';
import * as XLSX from 'xlsx';
import { Checkbox } from "@/components/ui/checkbox";

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
  importedValue?: string;
}

interface Message {
  id: number;
  author: string;
  message: string;
  inserted_at: string;
  replied_to: number | null;
  last_updated: string | null;
  email: string; // Add this line to include email in the Message interface
}

interface File {
  id: number;
  file_name: string;
  file_destination: string;
}

// New interfaces for AI chat
interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
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
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'ai'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isVeraLoading, setIsVeraLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [suggestedMappings, setSuggestedMappings] = useState<{ [key: string]: string }>({});

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

  const fetchMessages = useCallback(async (taskId: number) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('task_id', taskId)
      .order('inserted_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  }, []);

  const fetchFiles = useCallback(async (taskId: number) => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('task_id', taskId);

    if (error) {
      console.error('Error fetching files:', error);
    } else {
      setFiles(data || []);
    }
  }, []);

  const handleIconClick = (tab: 'chat' | 'files' | 'ai', taskId: string) => {
    setActiveTab(tab);
    setActiveTaskId(parseInt(taskId, 10));
    if (tab === 'chat') {
      fetchMessages(parseInt(taskId, 10));
    } else if (tab === 'files') {
      fetchFiles(parseInt(taskId, 10));
    } else {
      // Initialize AI chat (you may want to implement this based on your AI integration)
      setAiMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeTaskId || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          task_id: activeTaskId,
          author: `${currentUser.profile.firstname} ${currentUser.profile.lastname}`,
          message: newMessage.trim(),
          company: currentUser.profile.company,
          email: currentUser.email,
          replied_to: replyingToId
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prevMessages => [...prevMessages, data]);
      setNewMessage('');
      setReplyingToId(null);

      // Create notification for other users assigned to this task
      const { data: taskOwners } = await supabase
        .from('task_owners')
        .select('user_id')
        .eq('task_id', activeTaskId);

      taskOwners?.forEach(owner => {
        if (owner.user_id !== currentUser.id) {
          createNotification(owner.user_id, `New message in task ${activeTaskId} from ${currentUser.profile.firstname} ${currentUser.profile.lastname}`);
        }
      });

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

  const renderMessage = (message: Message) => (
    <div key={message.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-2">
      {message.replied_to && (
        <div className="text-sm text-gray-500 mb-1">
          Replying to: {messages.find(m => m.id === message.replied_to)?.message.substring(0, 50)}...
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
  const viewFile = (fileDestination: string) => {
    // Implement the logic to view or download the file
    console.log('Viewing file:', fileDestination);
    // You might want to open the file in a new tab or trigger a download
    window.open(fileDestination, '_blank');
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
        mappings[key] = matchingTask.id;
      }
    });
    return mappings;
  };

  const processImportedData = (mappings: { [key: string]: string }, applyToAll: boolean) => {
    const updatedTasks = combinedTasks.map(task => {
      const matchingColumn = Object.entries(mappings).find(([_, value]) => value === task.id)?.[0];
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
                        <SelectItem key={task.id} value={task.id}>
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

  return (
    <div className="min-h-screen bg-[#DDEBFF] dark:bg-gray-900 text-[#1F2937] dark:text-gray-100 text-base font-poppins flex flex-col">
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

      <div className="flex-grow flex overflow-hidden pl-12">
        <div className="w-[70%] pr-4 overflow-y-auto">
          {error && <p className="text-red-500 mb-4 max-w-[450px]">{error}</p>}

          <div className="mb-4 flex justify-end">
            <Button
              onClick={handleImportData}
              className="flex items-center bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors duration-200"
            >
              <FaUpload className="mr-2" />
              Import Data
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
            />
          </div>

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
                      <div className="flex items-center justify-between w-[345px] h-[40px] px-4 bg-transparent border border-gray-600 dark:border-gray-400 rounded-full">
                        <div className="flex items-center">
                          <Switch id={`done-${task.id}`} />
                          <label htmlFor={`done-${task.id}`} className="text-sm font-light text-[#1F2937] dark:text-gray-300 ml-2">Done</label>
                        </div>
                        <div className="flex items-center space-x-6">
                          <FaRobot 
                            className="text-[#1F2937] dark:text-gray-300 cursor-pointer" 
                            title="AI Assistant" 
                            onClick={() => handleIconClick('ai', task.id.toString())}
                          />
                          <FaPaperclip 
                            className="text-[#1F2937] dark:text-gray-300 cursor-pointer" 
                            title="Attach File" 
                            onClick={() => handleIconClick('files', task.id.toString())}
                          />
                          <FaComments 
                            className="text-[#1F2937] dark:text-gray-300 cursor-pointer" 
                            title="Chat" 
                            onClick={() => handleIconClick('chat', task.id.toString())}
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
                      value={task.importedValue || ''} // Add this line to display imported value
                      onChange={(e) => {
                        // Handle manual changes to the imported data
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
        <div className="w-[30%] fixed right-0 top-0 bottom-0 p-4 overflow-y-auto bg-transparent dark:bg-transparent border-l border-gray-300 dark:border-gray-600">
          <div className="h-full flex flex-col">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {activeTab === 'chat' ? 'Chat' : activeTab === 'files' ? 'Files' : 'AI Assistant'}
              </h2>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('chat')}>Close</Button>
            </div>
            <div className="flex-grow overflow-y-auto">
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                  <div className="mt-4">
                    {replyingToId && (
                      <div className="text-sm text-gray-500 mb-2">
                        Replying to: {messages.find(m => m.id === replyingToId)?.message.substring(0, 50)}...
                        <Button variant="link" onClick={() => setReplyingToId(null)}>Cancel</Button>
                      </div>
                    )}
                    <Textarea 
                      placeholder="Type your message..." 
                      className="w-full border border-gray-600 dark:border-gray-400 rounded-md"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button className="mt-2 w-full" onClick={sendMessage}>Send</Button>
                  </div>
                </div>
              )}
              {activeTab === 'files' && (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaPaperclip className="text-gray-500" />
                        <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => viewFile(file.file_destination)}>
                          {file.file_name}
                        </span>
                      </div>
                      <FaDownload className="text-gray-500 cursor-pointer" onClick={() => viewFile(file.file_destination)} />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'ai' && (
                <div className="flex-grow flex flex-col">
                  <div className="flex-grow overflow-y-auto mb-4">
                    {aiMessages.map((message, index) => (
                      <div key={index} className={`mb-4 ${message.role === 'assistant' ? 'bg-blue-50 dark:bg-blue-900 p-3 rounded-lg' : ''}`}>
                        <strong>{message.role === 'assistant' ? 'Vera: ' : 'You: '}</strong>
                        {message.role === 'assistant' ? (
                          <ReactMarkdown 
                            className="prose dark:prose-invert max-w-none"
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                              hr: ({node, ...props}) => <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />,
                            }}
                          >
                            {formatVeraResponse(message.content)}
                          </ReactMarkdown>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    ))}
                    {isVeraLoading && (
                      <div className="mb-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Ask Vera..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendVeraMessage();
                          }
                        }}
                        disabled={isVeraLoading}
                      />
                      <Button 
                        onClick={sendVeraMessage}
                        disabled={isVeraLoading}
                      >
                        {isVeraLoading ? 'Thinking...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImportDialog />
    </div>
  );
}

export default withAuth(DisclosureDetailsPage);