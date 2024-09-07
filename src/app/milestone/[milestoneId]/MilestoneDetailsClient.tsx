'use client'

import React from 'react'
import { ChevronLeft, Plus, Paperclip } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/supabase'

type Milestone = Database['public']['Tables']['milestones']['Row']
type Action = Database['public']['Tables']['actions']['Row'] & {
  tasks_for_actions: Database['public']['Tables']['tasks_for_actions']['Row'][]
}
type Update = Database['public']['Tables']['task_updates']['Row'] & {
  profiles: {
    firstname: string
    lastname: string
  }
}

interface MilestoneDetailsClientProps {
  milestone: Milestone
  actions: Action[]
  updates: Update[]
}

const MilestoneDetailsClient: React.FC<MilestoneDetailsClientProps> = ({ milestone, actions, updates }) => {
  const router = useRouter()

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  const handleMilestoneClick = (milestoneId: number) => {
    router.push(`/milestone/${milestoneId}`)
  }

  return (
    <div className="p-8 max-w-[1800px] mx-auto bg-gray-100 min-h-screen">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ChevronLeft className="mr-2" size={20} /> Back
        </Button>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">{milestone.notes}</h1>
          <div>
            <Button variant="outline" className="mr-3 px-6">Edit</Button>
            <Button variant="outline" className="mr-3 px-6">Delete</Button>
            <Button variant="outline" className="px-6">Share</Button>
          </div>
        </div>
        <p className="text-lg text-gray-500">{milestone.impact_on_target}</p>
        <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full mt-2">
          {milestone.status}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Milestone Year</h3>
            <p className="text-3xl font-bold">{new Date(milestone.period_end).getFullYear()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Total Actions</h3>
            <p className="text-3xl font-bold">{actions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Completed Actions</h3>
            <p className="text-3xl font-bold">
              {actions.filter(action => action.status === 'Completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Days Remaining</h3>
            <p className="text-3xl font-bold">{calculateDaysRemaining(milestone.period_end)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6">
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-4">Actions</h2>

          {actions.map(action => (
            <Card key={action.id} className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-medium">{action.documentation}</h3>
                  <div className="flex items-center">
                    <span className="text-lg text-gray-500 mr-4">{action.due_date}</span>
                    <Button variant="secondary" size="lg">Complete</Button>
                  </div>
                </div>
                <Progress value={action.status === 'Completed' ? 100 : 0} className="mb-6 h-2" />
                <h4 className="text-lg font-medium mb-3">Tasks</h4>
                {action.tasks_for_actions.map(task => (
                  <div key={task.id} className="flex justify-between items-center p-4 bg-gray-50 rounded mb-3">
                    <div>
                      <p className="text-lg font-medium">{task.description}</p>
                      <p className="text-base text-gray-500">{task.owner}</p>
                    </div>
                    <div className="flex items-center">
                      <Button variant="secondary" size="lg" className="mr-4">Complete</Button>
                      <span className="text-base text-gray-500">{task.due_date}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="lg" className="mt-4"><Plus size={20} className="mr-2" /> Add Task</Button>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" size="lg" className="mb-8"><Plus size={20} className="mr-2" /> Add Action</Button>
        </div>

        <div className="w-1/3">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-6">Updates</h3>
              {updates.map(update => (
                <div key={update.id} className="mb-6">
                  <p className="text-lg mb-2">{update.update_description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">{new Date(update.created_at).toLocaleString()}</span>
                    <span className="text-sm font-medium">{`${update.profiles.firstname} ${update.profiles.lastname}`}</span>
                  </div>
                  <Button variant="link" size="sm"><Paperclip size={16} className="mr-2" /> Attachments</Button>
                </div>
              ))}
              <Button variant="outline" size="lg" className="mt-4 w-full"><Plus size={20} className="mr-2" /> Add Update</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MilestoneDetailsClient