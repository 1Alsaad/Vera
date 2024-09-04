'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface CreateTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targetData: any) => void;
  companyId: string;
  userId: string;
  topicId: string;
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
  });

  const [disclosures, setDisclosures] = useState<any[]>([]);
  const [datapoints, setDatapoints] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchDisclosures();
      fetchDatapoints();
      fetchOwners();
    }
  }, [isOpen, topicId, companyId]);

  const fetchDisclosures = async () => {
    const { data, error } = await supabase
      .from('disclosures')
      .select('id, reference')
      .eq('topic', topicId)
      .eq('metric_type', 'Metrics');
    if (data) setDisclosures(data);
    if (error) console.error('Error fetching disclosures:', error);
  };

  const fetchDatapoints = async () => {
    const { data, error } = await supabase
      .from('datapoint_materiality_assessments')
      .select(`
        datapoint_id,
        data_points:datapoint_id(id, name)
      `)
      .eq('topic', topicId)
      .eq('company', companyId)
      .eq('materiality', 'Material');

    if (error) {
      console.error('Error fetching datapoints:', error);
    } else if (data) {
      const formattedDatapoints = data.map(item => item.data_points).filter(dp => dp);
      setDatapoints(formattedDatapoints);
    }
  };

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
    setTargetData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTargetData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = {
      ...targetData,
      topic: topicId,
      company: companyId,
      created_by: userId,
      baseline_year: parseInt(targetData.baseline_year),
      target_year: parseInt(targetData.target_year),
      current_value: null // You may want to set this based on user input or leave it as null
    };
    
    try {
      const { data, error } = await supabase
        .from('targets')
        .insert([newTarget])
        .select();

      if (error) throw error;

      console.log('New target created:', data);
      onSave(data[0]);
      onClose();
    } catch (error) {
      console.error('Error creating target:', error);
      // Handle error (show message to user, etc.)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-4xl border border-[#71A1FC] shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-6 text-[#1F2937]">Create New Target</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937]">Target Name</label>
            <input
              type="text"
              name="target_name"
              value={targetData.target_name}
              onChange={handleInputChange}
              placeholder="Enter a descriptive name for your target"
              className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] placeholder-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937]">Disclosure (Metrics)</label>
            <select
              name="disclosure"
              value={targetData.disclosure}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
            >
              <option value="">Select Disclosure</option>
              {disclosures.map(disclosure => (
                <option key={disclosure.id} value={disclosure.id}>{disclosure.reference}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937]">Material Datapoint</label>
            <select
              name="datapoint"
              value={targetData.datapoint}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
            >
              <option value="">Select Datapoint</option>
              {datapoints.map(datapoint => (
                <option key={datapoint.id} value={datapoint.id}>{datapoint.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937]">Target Owner</label>
            <select
              name="owner"
              value={targetData.owner}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
            >
              <option value="">Select Owner</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>{`${owner.firstname} ${owner.lastname}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937]">Target Type</label>
            <select
              name="target_type"
              value={targetData.target_type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
            >
              <option value="">Select Target Type</option>
              <option value="absolute">Absolute</option>
              <option value="relative">Relative</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Baseline Year</label>
              <input
                type="text"
                name="baseline_year"
                value={targetData.baseline_year}
                onChange={handleInputChange}
                placeholder="YYYY"
                className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] placeholder-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Baseline Value</label>
              <input
                type="text"
                name="baseline_value"
                value={targetData.baseline_value}
                onChange={handleInputChange}
                placeholder="Enter Value"
                className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] placeholder-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Target Year</label>
              <input
                type="text"
                name="target_year"
                value={targetData.target_year}
                onChange={handleInputChange}
                placeholder="YYYY"
                className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] placeholder-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Target Value</label>
              <input
                type="text"
                name="target_value"
                value={targetData.target_value}
                onChange={handleInputChange}
                placeholder="Enter Value"
                className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] placeholder-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937]">Justification</label>
            <textarea
              name="justification"
              value={targetData.justification}
              onChange={handleInputChange}
              placeholder="Explain the rationale for this target, the methodology used to calculate it, and any key assumptions made. Provide context on how the target aligns with your company's sustainability strategy"
              className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] placeholder-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
              rows={4}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937]">Stakeholder Involvement</label>
            <textarea
              name="stakeholders_involvement"
              value={targetData.stakeholders_involvement}
              onChange={handleInputChange}
              placeholder="Describe how stakeholders were involved in the process of setting this target. List the stakeholder groups consulted and the methods used for engagement (e.g., surveys, meetings, workshops)."
              className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] placeholder-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
              rows={4}
            ></textarea>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_scientific_based"
              checked={targetData.is_scientific_based}
              onChange={handleCheckboxChange}
              className="rounded border-[#71A1FC] text-[#3B82F6] bg-transparent focus:ring-[#3B82F6] focus:ring-opacity-50"
            />
            <label className="ml-2 block text-sm text-[#1F2937]">Is this target based on scientific evidence?</label>
          </div>
          {targetData.is_scientific_based && (
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Scientific Evidence</label>
              <textarea
                name="scientific_evidence"
                value={targetData.scientific_evidence}
                onChange={handleInputChange}
                placeholder="Provide details on the scientific evidence supporting this target"
                className="mt-1 block w-full rounded-md border border-[#71A1FC] bg-transparent text-[#1F2937] placeholder-[#1F2937] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
                rows={4}
              ></textarea>
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent border border-[#71A1FC] text-[#1F2937] rounded-md hover:bg-[#71A1FC] hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-[#71A1FC] focus:ring-opacity-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#3B82F6] hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-50">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTargetModal;