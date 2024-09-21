import React from 'react';

export const Marquee: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`overflow-hidden ${className}`}>
    <div className="animate-marquee whitespace-nowrap">
      {children}
      <span className="mx-4">•</span>
      {children}
    </div>
  </div>
);