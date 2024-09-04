import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestoneData: any) => void;
  targetId: string;
  companyId: string;
  currentUserId: string;
}

const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({ 
  isOpen, onClose, onSave, targetId, companyId, currentUserId 
}) => {
  const [milestoneData, setMilestoneData] = useState({
    owner: '',
    period_end: undefined as Date | undefined,
    required: false,
    impact_on_target: '',
    status: 'Planned',
    notes: ''
  });
  const [owners, setOwners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOwners();
    }
  }, [isOpen, companyId]);

  const fetchOwners = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, firstname, lastname')
      .eq('company', companyId);
    if (data) setOwners(data);
    if (error) console.error('Error fetching owners:', error);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMilestoneData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setMilestoneData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setMilestoneData(prev => ({ ...prev, period_end: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!milestoneData.owner || !milestoneData.period_end || !milestoneData.impact_on_target) {
      setError('Missing required inputs');
      return;
    }

    const newMilestone = {
      ...milestoneData,
      target_id: targetId,
      created_by: currentUserId,
      period_end: milestoneData.period_end.toISOString(),
      // Remove the company field from here
    };

    onSave(newMilestone);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Create New Milestone</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700">Milestone Owner</label>
            <select
              id="owner"
              name="owner"
              value={milestoneData.owner}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="">Select Owner</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>{`${owner.firstname} ${owner.lastname}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="period_end" className="block text-sm font-medium text-gray-700">Milestone Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !milestoneData.period_end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {milestoneData.period_end ? format(milestoneData.period_end, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={milestoneData.period_end}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label htmlFor="impact_on_target" className="block text-sm font-medium text-gray-700">Impact on target (%)</label>
            <input
              type="number"
              id="impact_on_target"
              name="impact_on_target"
              value={milestoneData.impact_on_target}
              onChange={handleInputChange}
              placeholder="Enter target percentage change"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={milestoneData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={milestoneData.notes}
              onChange={handleInputChange}
              placeholder="Enter any relevant notes or internal comments"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            ></textarea>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              name="required"
              checked={milestoneData.required}
              onChange={handleCheckboxChange}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-900">Is this Milestone Required?</label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMilestoneModal;