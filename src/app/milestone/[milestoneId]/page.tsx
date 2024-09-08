import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import MilestoneDetailsClient from './MilestoneDetailsClient'

export default async function MilestoneDetails({ params }: { params: { milestoneId: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: milestone } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', params.milestoneId)
    .single()

  const { data: actions } = await supabase
    .from('actions')
    .select('*, tasks_for_actions(*)')
    .eq('milestone_id', params.milestoneId)

  if (!milestone) {
    return <div>Milestone not found</div>
  }

  return (
    <MilestoneDetailsClient
      milestone={milestone}
      actions={actions || []}
    />
  )
}