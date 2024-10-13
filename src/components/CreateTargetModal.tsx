"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CreateTargetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (targetData: any) => void
  companyId: string
  userId: string
  topicId: string
}

const CreateTargetModal: React.FC<CreateTargetModalProps> = ({ isOpen, onClose, onSave, companyId, userId, topicId }) => {
  const [targetData, setTargetData] = useState({
    target_name: '',
    disclosure: '',
    datapoint: '',
    baseline_year: '',
    baseline_value: '',
    target_year: '',
    target_value: '',
    target_type: '',
    owner: '',
    justification: '',
    stakeholders_involvement: '',
    is_scientific_based: false,
    scientific_evidence: ''
  })

  const [disclosures, setDisclosures] = useState<any[]>([])
  const [datapoints, setDatapoints] = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchDisclosures()
      fetchDatapoints()
      fetchOwners()
    }
  }, [isOpen, topicId, companyId])

  const fetchDisclosures = async () => {
    const { data, error } = await supabase
      .from('disclosures')
      .select('id, reference')
      .eq('topic', topicId)
      .eq('metric_type', 'Metrics')
    if (data) setDisclosures(data)
    if (error) console.error('Error fetching disclosures:', error)
  }

  const fetchDatapoints = async () => {
    const { data, error } = await supabase
      .from('datapoint_materiality_assessments')
      .select(`
        datapoint_id,
        data_points:datapoint_id(id, name)
      `)
      .eq('topic', topicId)
      .eq('company', companyId)
      .eq('materiality', 'Material')

    if (error) {
      console.error('Error fetching datapoints:', error)
    } else if (data) {
      const formattedDatapoints = data.map(item => item.data_points).filter(dp => dp)
      setDatapoints(formattedDatapoints)
    }
  }

  const fetchOwners = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, firstname, lastname')
      .eq('company', companyId)
    if (data) setOwners(data)
    if (error) console.error('Error fetching owners:', error)
  }

  const handleInputChange = (name: string, value: string) => {
    setTargetData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setTargetData(prev => ({ ...prev, is_scientific_based: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newTarget = {
      ...targetData,
      topic: topicId,
      company: companyId,
      created_by: userId,
      baseline_year: parseInt(targetData.baseline_year),
      target_year: parseInt(targetData.target_year),
      current_value: null
    }
    
    try {
      const { data, error } = await supabase
        .from('targets')
        .insert([newTarget])
        .select()

      if (error) throw error

      console.log('New target created:', data)
      onSave(data[0])
      onClose()
    } catch (error) {
      console.error('Error creating target:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Create New Target</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new sustainability target.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_name">Target Name</Label>
                  <Input
                    id="target_name"
                    value={targetData.target_name}
                    onChange={(e) => handleInputChange('target_name', e.target.value)}
                    placeholder="Enter a descriptive name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disclosure">Disclosure (Metrics)</Label>
                  <Select value={targetData.disclosure} onValueChange={(value) => handleInputChange('disclosure', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Disclosure" />
                    </SelectTrigger>
                    <SelectContent>
                      {disclosures.map(disclosure => (
                        <SelectItem key={disclosure.id} value={disclosure.id}>{disclosure.reference}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="datapoint">Material Datapoint</Label>
                  <Select value={targetData.datapoint} onValueChange={(value) => handleInputChange('datapoint', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Datapoint" />
                    </SelectTrigger>
                    <SelectContent>
                      {datapoints.map(datapoint => (
                        <SelectItem key={datapoint.id} value={datapoint.id}>{datapoint.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Target Owner</Label>
                  <Select value={targetData.owner} onValueChange={(value) => handleInputChange('owner', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map(owner => (
                        <SelectItem key={owner.id} value={owner.id}>{`${owner.firstname} ${owner.lastname}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_type">Target Type</Label>
                <Select value={targetData.target_type} onValueChange={(value) => handleInputChange('target_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Target Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absolute">Absolute</SelectItem>
                    <SelectItem value="relative">Relative</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseline_year">Baseline Year</Label>
                  <Input
                    id="baseline_year"
                    value={targetData.baseline_year}
                    onChange={(e) => handleInputChange('baseline_year', e.target.value)}
                    placeholder="YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseline_value">Baseline Value</Label>
                  <Input
                    id="baseline_value"
                    value={targetData.baseline_value}
                    onChange={(e) => handleInputChange('baseline_value', e.target.value)}
                    placeholder="Enter Value"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_year">Target Year</Label>
                  <Input
                    id="target_year"
                    value={targetData.target_year}
                    onChange={(e) => handleInputChange('target_year', e.target.value)}
                    placeholder="YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_value">Target Value</Label>
                  <Input
                    id="target_value"
                    value={targetData.target_value}
                    onChange={(e) => handleInputChange('target_value', e.target.value)}
                    placeholder="Enter Value"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  value={targetData.justification}
                  onChange={(e) => handleInputChange('justification', e.target.value)}
                  placeholder="Explain the rationale for this target, methodology, and key assumptions"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stakeholders_involvement">Stakeholder Involvement</Label>
                <Textarea
                  id="stakeholders_involvement"
                  value={targetData.stakeholders_involvement}
                  onChange={(e) => handleInputChange('stakeholders_involvement', e.target.value)}
                  placeholder="Describe how stakeholders were involved in setting this target"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_scientific_based"
                  checked={targetData.is_scientific_based}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="is_scientific_based">Is this target based on scientific evidence?</Label>
              </div>

              {targetData.is_scientific_based && (
                <div className="space-y-2">
                  <Label htmlFor="scientific_evidence">Scientific Evidence</Label>
                  <Textarea
                    id="scientific_evidence"
                    value={targetData.scientific_evidence}
                    onChange={(e) => handleInputChange('scientific_evidence', e.target.value)}
                    placeholder="Provide details on the scientific evidence supporting this target"
                    rows={4}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Target</Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTargetModal