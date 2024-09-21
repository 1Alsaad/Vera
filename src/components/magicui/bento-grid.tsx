import React from 'react';

const BentoGridItem: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ title, children, className }) => (
  <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p>{children}</p>
  </div>
);

const BentoGrid: React.FC<React.PropsWithChildren<{ className?: string }>> & { Item: typeof BentoGridItem } = ({ children, className }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
    {children}
  </div>
);

BentoGrid.Item = BentoGridItem;

export default BentoGrid;
