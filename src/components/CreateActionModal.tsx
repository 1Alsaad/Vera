import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface CreateActionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateAction: (action: any) => void
  isLoading: boolean
  users: { id: string; name: string }[]
  currentUserId: string
  milestoneId: number // Add this line
}

const CreateActionModal: React.FC<CreateActionModalProps> = ({
  isOpen,
  onClose,
  onCreateAction,
  isLoading,
  users,
  currentUserId,
  milestoneId // Add this line
}) => {
  const [documentation, setDocumentation] = useState('')
  const [ownerId, setOwnerId] = useState(currentUserId)
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('Planned') // Set a default status
  const [impactOnTarget, setImpactOnTarget] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateAction({
      documentation,
      owner_id: ownerId,
      due_date: dueDate,
      status,
      impact_on_target: impactOnTarget,
      milestone_id: milestoneId // Include the milestone_id
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Action</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="documentation" className="text-right">
                Documentation
              </Label>
              <Input
                id="documentation"
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner" className="text-right">
                Owner
              </Label>
              <Select onValueChange={setOwnerId} defaultValue={currentUserId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Input
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="impactOnTarget" className="text-right">
                Impact on Target
              </Label>
              <Input
                id="impactOnTarget"
                value={impactOnTarget}
                onChange={(e) => setImpactOnTarget(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Action'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateActionModal