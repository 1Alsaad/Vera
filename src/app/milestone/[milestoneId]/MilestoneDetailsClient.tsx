'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Plus, Paperclip, Check, ChevronDown, ChevronUp, Edit, Trash2, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/supabase'
import { Badge } from '@/components/ui/badge'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import CreateTaskModal from '@/components/CreateTaskModal'
import { useUser } from '@supabase/auth-helpers-react'
import CreateActionModal from '@/components/CreateActionModal'
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import AddUpdateModal from '@/components/AddUpdateModal'
import { v4 as uuidv4 } from 'uuid'

type Milestone = Database['public']['Tables']['milestones']['Row']
type Action = Database['public']['Tables']['actions']['Row'] & {
  tasks_for_actions: Database['public']['Tables']['tasks_for_actions']['Row'][]
}
type TaskUpdate = {
  id: number
  milestone_id: number | null
  action_id: number | null
  task_id: number | null
  update_description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  fullname: string
  attachments: { name: string; url: string }[]
}

interface MilestoneDetailsClientProps {
  milestone: Milestone
  actions: Action[]
}

const MilestoneDetailsClient: React.FC<MilestoneDetailsClientProps> = ({ milestone, actions }) => {
  const router = useRouter()
  const [expandedActions, setExpandedActions] = useState<number[]>([])
  const [completedActions, setCompletedActions] = useState<number[]>([])
  const [selectedTask, setSelectedTask] = useState<number | null>(null)
  const [updates, setUpdates] = useState<TaskUpdate[]>([])
  const updatesRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient<Database>()
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [currentActionId, setCurrentActionId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false)
  const [isCreatingAction, setIsCreatingAction] = useState(false)
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false)
  const [isAddingUpdate, setIsAddingUpdate] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  const toggleAction = (actionId: number) => {
    setExpandedActions(prev => 
      prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
    )
  }

  const toggleComplete = (actionId: number) => {
    setCompletedActions(prev =>
      prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
    )
  }

  const fetchUpdates = async (milestoneId: number, actionId: number, taskId: number) => {
    const { data, error } = await supabase
      .from('task_updates')
      .select(`
        *,
        profiles:created_by (firstname, lastname)
      `)
      .eq('milestone_id', milestoneId)
      .eq('action_id', actionId)
      .eq('task_id', taskId)

    if (error) {
      console.error('Error fetching updates:', error)
      return
    }

    const formattedUpdates = data.map(update => ({
      ...update,
      fullname: update.profiles && typeof update.profiles === 'object' 
        ? `${(update.profiles as any).firstname || ''} ${(update.profiles as any).lastname || ''}`.trim() || 'Unknown'
        : 'Unknown',
      created_at: update.created_at ? new Date(update.created_at).toLocaleString() : '',
      updated_at: update.updated_at ? new Date(update.updated_at).toLocaleString() : ''
    }))

    setUpdates(formattedUpdates as TaskUpdate[])
  }

  const handleTaskClick = (actionId: number, taskId: number) => {
    setSelectedTask(taskId)
    fetchUpdates(milestone.id, actionId, taskId)
    if (updatesRef.current) {
      updatesRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCreateTask = async (task: any) => {
    if (!user || !user.id || !currentActionId) {
      toast({
        title: "Error",
        description: "Unable to create task. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('company')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      const company = userData.company

      if (!company) throw new Error("User's company not found")

      const { data, error } = await supabase
        .from('tasks_for_actions')
        .insert([
          {
            description: task.description,
            owner: task.owner,
            due_date: task.due_date,
            status: task.status,
            company: company,
            action_id: currentActionId
          }
        ])
        .select('id')

      if (error) throw error

      const actionTaskId = data[0].id

      const { error: actionTasksError } = await supabase
        .from('action_tasks')
        .insert([
          {
            action_id: currentActionId,
            action_task_id: actionTaskId
          }
        ])

      if (actionTasksError) throw actionTasksError

      toast({
        title: "Success",
        description: "Task created successfully",
      })

      // Refresh the action data
      // This is a placeholder - you'll need to implement this function
      await refreshActionData(milestone.id)

    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsCreateTaskModalOpen(false)
    }
  }

  const refreshActionData = async (milestoneId: number) => {
    // Implement the logic to fetch updated action data
    // This might involve making a new API call to get the latest actions
    // and then updating the state
    // For example:
    // const { data, error } = await supabase
    //   .from('actions')
    //   .select('*, tasks_for_actions(*)')
    //   .eq('milestone_id', milestoneId)
    // if (data) {
    //   // Update your state with the new data
    //   // You might need to modify your component props or state management to accommodate this
    // }
  }

  const handleCreateAction = async (action: any) => {
    if (!user || !user.profile || !user.profile.company) {
      toast({
        title: "Error",
        description: "User information is incomplete.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingAction(true)

    try {
      const { data, error } = await supabase
        .from('actions')
        .insert([
          {
            documentation: action.documentation,
            owner_id: action.owner_id,
            due_date: action.due_date,
            status: action.status,
            company: user.profile.company,
            milestone_id: milestone.id,
            impact_on_target: action.impact_on_target
          }
        ])
        .select('id')

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('Failed to retrieve the action ID.')
      }

      const actionId = data[0].id

      const { error: milestoneError } = await supabase
        .from('milestone_actions')
        .insert([
          {
            milestone_id: milestone.id,
            action_id: actionId
          }
        ])

      if (milestoneError) throw milestoneError

      toast({
        title: "Success",
        description: "Action created successfully",
      })

      // Refresh the action data
      await refreshActionData(milestone.id)

    } catch (error) {
      console.error('Error creating action:', error)
      toast({
        title: "Error",
        description: "Failed to create action. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingAction(false)
      setIsCreateActionModalOpen(false)
    }
  }

  const handleAddUpdate = async (updateDescription: string, files: File[]) => {
    if (!user || !user.id || !selectedTask) {
      toast({
        title: "Error",
        description: "Unable to add update. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsAddingUpdate(true)

    try {
      const actionId = actions.find(action => action.tasks_for_actions.some(task => task.id === selectedTask))?.id

      // Check if all required inputs have values
      if (!milestone.id || !actionId || !selectedTask || !updateDescription || !user.id) {
        throw new Error("Missing required information for update")
      }

      console.log("Milestone ID:", milestone.id)
      console.log("Action ID:", actionId)
      console.log("Task ID:", selectedTask)
      console.log("Update Description:", updateDescription)
      console.log("User ID:", user.id)

      // Insert the update
      const { data, error } = await supabase
        .from('task_updates')
        .insert([
          {
            milestone_id: milestone.id,
            action_id: actionId,
            task_id: selectedTask,
            update_description: updateDescription,
            created_by: user.id
          }
        ])

      if (error) {
        console.error('Error adding update:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to add update. Please try again.",
          variant: "destructive",
        })
        return // Exit the function if there's an error
      }

      toast({
        title: "Success",
        description: "Update added successfully",
      })

      // Refresh the updates
      await fetchUpdates(milestone.id, actionId, selectedTask)

    } catch (error) {
      console.error('Error adding update:', error)
      toast({
        title: "Error",
        description: "Failed to add update. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingUpdate(false)
      setIsAddUpdateModalOpen(false)
    }
  }

  const handleDeleteAction = async (actionId: number) => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only admins can delete actions.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Action deleted successfully",
      })

      // Refresh the actions data
      await refreshActionData(milestone.id)

    } catch (error) {
      console.error('Error deleting action:', error)
      toast({
        title: "Error",
        description: "Failed to delete action. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (actionId: number, taskId: number) => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only admins can delete tasks.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('tasks_for_actions')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })

      // Refresh the action data
      await refreshActionData(milestone.id)

    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Fetch all updates for the milestone when the component mounts
    fetchUpdates(milestone.id, 0, 0)
    // Fetch users for the dropdown
    fetchUsers()
  }, [milestone.id])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, firstname, lastname')

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    const formattedUsers = data.map(user => ({
      id: user.id,
      name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown'
    }))

    setUsers(formattedUsers)
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setUser({ ...user, profile })
      }
    }

    fetchUser()
  }, [supabase])

  useEffect(() => {
    // Check if the current user is an admin
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', user.id)
          .single()
        
          setIsAdmin(profile?.user_role === 'Administrator')
              }
    }

    checkAdminStatus()
  }, [supabase])

  return (
    <div className="flex h-screen bg-[#EBF8FF]">
      <div className="flex-grow overflow-auto p-6 md:p-10">
        <Button className="mb-6 bg-[#BBCDEF] text-[#1E293B] hover:bg-[#BBCDEF]/90" onClick={() => router.back()}>
          <ChevronLeft className="mr-2" size={20} /> Back
        </Button>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2">{milestone.notes}</h1>
              <p className="text-base md:text-lg text-gray-600">{milestone.impact_on_target}</p>
            </div>
            <div className="space-y-2 md:space-y-0 md:space-x-3 flex flex-col md:flex-row">
              <Button className="bg-[#020B19] text-white hover:bg-[#020B19]/90 rounded-full w-[120px] h-[35px] flex justify-center items-center">
                <Edit size={20} className="mr-2" /> Edit
              </Button>
              <Button className="bg-[#BBCDEF] text-[#1E293B] hover:bg-[#BBCDEF]/90 rounded-full w-[100px] h-[35px] flex justify-center items-center">
                <Trash2 size={20} className="mr-2" /> Delete
              </Button>
              <Button className="bg-[#BBCDEF] text-[#1E293B] hover:bg-[#BBCDEF]/90 rounded-full w-[100px] h-[35px] flex justify-center items-center">
                <Share2 size={20} className="mr-2" /> Share
              </Button>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">{milestone.status}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { title: 'Milestone Year', value: new Date(milestone.period_end).getFullYear() },
            { title: 'Total Actions', value: actions.length },
            { title: 'Completed Actions', value: actions.filter(action => action.status === 'Completed').length },
            { title: 'Days Remaining', value: calculateDaysRemaining(milestone.period_end) },
          ].map((item, index) => (
            <Card key={index} className="bg-[#B5C1D0]/[0.56] border-none">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-medium text-[#1E293B]">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl md:text-3xl font-bold text-[#1E293B]">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-grow lg:w-2/3">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#1E293B]">Actions</h2>
            {actions.map(action => (
              <Card key={action.id} className="mb-6 bg-[#B5C1D0]/[0.56] border-none">
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg md:text-xl font-medium text-[#1E293B]">{action.documentation}</h3>
                    <div className="flex items-center">
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          onClick={() => handleDeleteAction(action.id)}
                          className="p-1 mr-2"
                        >
                          <Trash2 size={20} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleAction(action.id)}
                        className="p-1"
                      >
                        {expandedActions.includes(action.id) ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </div>
                  </div>
                  
                  <Progress 
                    value={33} 
                    className="mb-4 h-5 bg-gray-200 [&>div]:bg-[#020B19] [&>div]:rounded-full" 
                  />
                                    
                  <div className="flex justify-between items-center">
                    <span className="text-base md:text-lg text-gray-600">{action.due_date}</span>
                    <Button 
                      className={`rounded-full px-4 h-[30px] flex items-center text-sm ${
                        completedActions.includes(action.id)
                          ? 'bg-[#020B19] text-white hover:bg-[#020B19]/90'
                          : 'bg-transparent hover:bg-transparent text-[#020B19] border border-[#020B19]'
                      }`}
                      onClick={() => toggleComplete(action.id)}
                    >
                      <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${
                        completedActions.includes(action.id)
                          ? 'bg-white'
                          : 'border border-current'
                      }`}>
                        <Check className={`h-3 w-3 ${
                          completedActions.includes(action.id)
                            ? 'text-[#020B19]'
                            : 'text-current'
                        }`} />
                      </span>
                      {completedActions.includes(action.id) ? 'Completed' : 'Complete'}
                    </Button>
                  </div>

                  {expandedActions.includes(action.id) && (
                    <>
                      <h4 className="text-base md:text-lg font-medium my-4 text-[#1E293B]">Tasks</h4>
                      {action.tasks_for_actions.map(task => (
                        <div
                          key={task.id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 md:p-4 bg-[#B5C1D0]/[0.56] rounded mb-3 cursor-pointer"
                        >
                          <div className="mb-2 md:mb-0" onClick={() => handleTaskClick(action.id, task.id)}>
                            <p className="text-base md:text-lg font-medium text-[#1E293B]">{task.description}</p>
                            <p className="text-sm md:text-base text-gray-600">{task.owner}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            {isAdmin && (
                              <Button 
                                variant="ghost"
                                onClick={() => handleDeleteTask(action.id, task.id)}
                                className="p-1"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                            <Button className="bg-transparent hover:bg-transparent text-[#020B19] border border-[#020B19] rounded-full px-4 h-[30px] flex items-center text-sm">
                              <Check className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                            <span className="text-sm md:text-base text-gray-600">{task.due_date}</span>
                          </div>
                        </div>
                      ))}
                      <Button 
                        className="mt-4 bg-[#020B19] text-white hover:bg-[#020B19]/90"
                        onClick={() => {
                          setCurrentActionId(action.id)
                          setIsCreateTaskModalOpen(true)
                        }}
                      >
                        <Plus size={20} className="mr-2" /> Add Task
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
            <Button 
              className="mb-8 bg-[#020B19] text-white hover:bg-[#020B19]/90"
              onClick={() => setIsCreateActionModalOpen(true)}
            >
              <Plus size={20} className="mr-2" /> Add Action
            </Button>
          </div>

          <div className="lg:w-1/3">
            <Card className="sticky top-6 bg-[#B5C1D0]/[0.56] border-none">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-[#1E293B]">
                  {selectedTask ? 'Task Updates' : 'All Updates'}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto" ref={updatesRef}>
                {updates.length > 0 ? (
                  updates.map(update => (
                    <div key={update.id} className="mb-6">
                      <p className="text-base md:text-lg mb-2 text-[#1E293B]">{update.update_description}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs md:text-sm text-gray-600">{update.created_at}</span>
                        <span className="text-xs md:text-sm font-medium text-[#1E293B]">{update.fullname}</span>
                      </div>
                      <div>
                        {update.attachments && Array.isArray(update.attachments) && update.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:underline"
                          >
                            <Paperclip size={16} className="mr-2" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No updates available for this task.</p>
                )}
              </CardContent>
              <div className="p-4">
                <Button 
                  className="w-full bg-[#020B19] text-white hover:bg-[#020B19]/90"
                  onClick={() => setIsAddUpdateModalOpen(true)}
                >
                  <Plus size={20} className="mr-2" /> Add Update
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        isLoading={isLoading}
        actionId={currentActionId!}
        users={users}
      />
      
      {user && (
        <CreateActionModal
          isOpen={isCreateActionModalOpen}
          onClose={() => setIsCreateActionModalOpen(false)}
          onCreateAction={handleCreateAction}
          isLoading={isCreatingAction}
          users={users}
          currentUserId={user.id}
          milestoneId={milestone.id}
        />
      )}
      
      <AddUpdateModal
        isOpen={isAddUpdateModalOpen}
        onClose={() => setIsAddUpdateModalOpen(false)}
        onAddUpdate={handleAddUpdate}
        isLoading={isAddingUpdate}
      />
    </div>
  )
}

export default MilestoneDetailsClient