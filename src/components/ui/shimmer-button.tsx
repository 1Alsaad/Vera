import React from 'react';

export const ShimmerButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button
    className={`relative px-4 py-2 bg-blue-500 text-white rounded overflow-hidden ${className}`}
    {...props}
  >
    <span className="relative z-10">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shimmer" />
  </button>
);