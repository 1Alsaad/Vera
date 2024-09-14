//src\components\AssignOwnerModal.tsx

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Profile {
  id: string;
  firstname: string;
  lastname: string;
}

interface AssignOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string) => void;
  onRemove: (userId: string) => void;
  companyId: string;
  currentOwnerId: string | null;
}

const AssignOwnerModal: React.FC<AssignOwnerModalProps> = ({ 
  isOpen, onClose, onAssign, onRemove, companyId, currentOwnerId 
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, firstname, lastname')
        .eq('company', companyId);

      if (error) {
        console.error('Error fetching profiles:', error);
      } else if (data) {
        setProfiles(data);
      }
    };

    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#DDEBFF] bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 p-8 rounded-lg w-full max-w-4xl border border-[#71A1FC] dark:border-gray-700 shadow-lg">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex justify-between items-center py-2 border-b border-[#71A1FC] dark:border-gray-700 last:border-b-0">
              <span className="text-[#1F2937] dark:text-gray-300 text-lg">{`${profile.firstname} ${profile.lastname}`}</span>
              {currentOwnerId === profile.id ? (
                <button
                  onClick={() => onRemove(profile.id)}
                  className="px-4 py-2 bg-transparent border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => onAssign(profile.id)}
                  className="px-4 py-2 bg-transparent border border-[#3B82F6] text-[#3B82F6] rounded-full hover:bg-[#3B82F6] hover:text-white transition-colors"
                  disabled={currentOwnerId !== null}
                >
                  Assign
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-transparent border border-[#71A1FC] text-[#1F2937] dark:text-gray-100 rounded-full hover:bg-[#71A1FC] hover:text-white dark:hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AssignOwnerModal;