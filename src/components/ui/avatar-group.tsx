import React from 'react';

interface AvatarGroupProps {
  children: React.ReactNode;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ children }) => {
  return (
    <div className="flex -space-x-2 overflow-hidden">
      {children}
    </div>
  );
};