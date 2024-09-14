"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar } from 'react-chartjs-2'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, X } from 'lucide-react'
import { useSupabase } from '@/components/supabase/provider'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'

type DataPoint = {
  id: number 
  // add other properties as needed
}

type Task = {
  id: number
  datapoint: number
  importedValue?: string
  // add other properties as needed  
}

type CombinedTask = Task & {
  dataPointDetails: DataPoint
}

const DisclosurePage = () => {
  const params = useParams()
  const disclosureId = params?.disclosureId as string
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const [combinedTasks, setCombinedTasks] = useState<CombinedTask[]>([])
  const [error, setError] = useState<string | null>(null)

  // Add the saveTaskValue function
  const saveTaskValue = async (taskId: number, value: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ importedValue: value })  
        .eq('id', taskId);

      if (error) throw error;
        
      setCombinedTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, importedValue: value } : task
        )  
      );
    } catch (error) {
      console.error('Error updating task value:', error);
      setError('Failed to update task value'); 
    }
  };

  // Ensure fetchTasksAndDataPoints includes importedValue
  const fetchTasksAndDataPoints = useCallback(async () => {
    if (!currentUser || !currentUser.profile) return;

    try {
      let tasks: Task[] = [];
        
      if (currentUser.profile.user_role === 'Administrator') {
        const { data, error } = await supabase
          .from('tasks')
          .select('*') // Ensure 'importedValue' is selected
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
          .select('*') // Ensure 'importedValue' is selected
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
        
      const combined: CombinedTask[] = tasks.map(task => {
        const dataPointDetails = (dataPoints as DataPoint[]).find(dp => dp.id === task.datapoint) || ({} as DataPoint);
        return {
          ...task,
          dataPointDetails,
          importedValue: task.importedValue || '',  
        };
      });

      setCombinedTasks(combined);  
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');   
    }
  }, [currentUser, disclosureId])
    
  useEffect(() => {
    fetchTasksAndDataPoints();
  }, [fetchTasksAndDataPoints]);

  // Placeholder data for demonstration
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Data',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'hsl(var(--primary))',
      },
    ],
  }
      
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Define the uploadFile function
      const uploadFile = async (file: File) => {
        // Implement the file upload logic here  
        // For example, using Supabase Storage:
        const { data, error } = await supabase.storage
          .from('files')
          .upload(`${disclosureId}/${file.name}`, file)
        console.log('File uploaded:', file.name)  
      }
          
      uploadFile(file)  
    }
  }

 return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`w-[500px] border-l bg-background transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Chat</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {disclosureId ? (
              <p>Chat content for Disclosure {disclosureId}</p>  
            ) : (
              <p className="text-muted-foreground">Pick a disclosure to show chat</p>
            )}
          </div>
          <div className="p-4 border-t">  
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full p-2 border rounded"
              disabled={!disclosureId}
            />
          </div>
        </div>
      </aside>
        
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <h1 className="text-2xl font-bold">Disclosure {disclosureId}</h1>
        
        {error && <p className="text-red-500">{error}</p>}
        
        {combinedTasks.map(task => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.dataPointDetails.name}</CardTitle>  
            </CardHeader>
            <CardContent>
              <Textarea
                id={`datapoint-${task.id}`}
                placeholder="Enter data point value"
                className="min-h-[200px] bg-transparent border border-gray-600 dark:border-gray-400 w-full text-[#1F2937] dark:text-gray-100 font-light rounded-md"
                value={task.importedValue || ''}  
                onChange={(e) => {
                  const value = e.target.value;
                  setCombinedTasks(prevTasks =>
                    prevTasks.map(t =>
                      t.id === task.id ? { ...t, importedValue: value } : t
                    )
                  ); 
                }}
                onBlur={(e) => saveTaskValue(task.id, e.target.value, disclosureId, task.dataPointDetails.id)}
              />
            </CardContent>
          </Card>
        ))}

        <Card>  
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar 
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true, 
                    text: 'Disclosure Data',
                  },
                },  
              }}
            />
          </CardContent>
        </Card>
          
        <div className="flex justify-end space-x-4">
          <Button variant="default">
            Primary Action   
          </Button>
          <Button variant="outline" onClick={() => setIsSidebarOpen(true)}>
            Open Chat
          </Button>
          <input
            type="file"  
            onChange={handleFileUpload}
            style={{ display: 'none' }} 
            id="fileInput"
          />
          <Button variant="outline" onClick={() => document.getElementById('fileInput')?.click()}>
            Upload File
          </Button>
        </div>
      </main>
    </div>
  )
}

export default DisclosurePage
