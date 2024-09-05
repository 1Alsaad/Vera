'use client';

import React from 'react';
import { Target, Milestone } from '@/types';

interface TargetDetailsProps {
  target: Target;
  milestones: Milestone[];
  userId: string | undefined;
}

const TargetDetails: React.FC<TargetDetailsProps> = ({ target, milestones, userId }) => {
  // ... rest of the component logic ...

  return (
    <div>
      <h1>Target Details</h1>
      <p>Target ID: {target.id}</p>
      <p>Company: {target.company}</p>
      <p>Topic: {target.topic}</p>
      <p>Baseline Value: {target.baseline_value}</p>
      <p>Baseline Year: {target.baseline_year}</p>
      <p>Current Value: {target.current_value}</p>
      <p>User ID: {userId}</p>
      <h2>Milestones:</h2>
      <ul>
        {milestones.map((milestone) => (
          <li key={milestone.id}>
            {milestone.period_end}: {milestone.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TargetDetails;