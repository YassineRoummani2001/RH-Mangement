import React from 'react';

export const Skeleton = ({ width, height, borderRadius = '8px', className = '' }) => {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ 
        width: width || '100%', 
        height: height || '20px', 
        borderRadius 
      }} 
    />
  );
};

export const CardSkeleton = () => (
  <div className="card" style={{ padding: '20px' }}>
    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
      <Skeleton width="48px" height="48px" borderRadius="12px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="60%" height="16px" />
        <Skeleton width="40%" height="12px" />
      </div>
    </div>
    <Skeleton height="100px" />
  </div>
);
