import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import MilestoneDetailsClient from './MilestoneDetailsClient'

export default async function MilestoneDetailsPage({ params }: { params: { milestoneId: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: milestone, error: milestoneError } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', params.milestoneId)
    .single()

  if (milestoneError) {
    console.error('Error fetching milestone:', milestoneError)
    return <div>Error loading milestone details</div>
  }

  const { data: actions, error: actionsError } = await supabase
    .from('actions')
    .select(`
      *,
      tasks_for_actions (*)
    `)
    .eq('milestone_id', params.milestoneId)

  if (actionsError) {
    console.error('Error fetching actions:', actionsError)
    return <div>Error loading actions</div>
  }

  const { data: updates, error: updatesError } = await supabase
    .from('task_updates')
    .select(`
      *,
      profiles (firstname, lastname)
    `)
    .eq('milestone_id', params.milestoneId)
    .order('created_at', { ascending: false })

  if (updatesError) {
    console.error('Error fetching updates:', updatesError)
    return <div>Error loading updates</div>
  }

  return <MilestoneDetailsClient milestone={milestone} actions={actions} updates={updates} />
}