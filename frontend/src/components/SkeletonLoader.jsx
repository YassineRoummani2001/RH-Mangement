import React from 'react';

/**
 * Renders a row of premium animated skeleton shimmers for data tables.
 */
export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} style={{ padding: '16px 20px' }}>
          <div 
            className="shimmer-bg"
            style={{ 
              height: '16px', 
              borderRadius: '8px',
              width: idx === 0 ? '60%' : (idx === cols - 1 ? '40%' : '80%')
            }}
          />
        </td>
      ))}
    </tr>
  );
};

/**
 * Renders a card of premium animated skeleton shimmers.
 */
export const CardSkeleton = () => {
  return (
    <div className="card glass-card animate-pulse" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="shimmer-bg" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div className="shimmer-bg" style={{ height: '16px', width: '40%', borderRadius: '4px' }} />
          <div className="shimmer-bg" style={{ height: '12px', width: '20%', borderRadius: '4px' }} />
        </div>
      </div>
      <div className="shimmer-bg" style={{ height: '14px', width: '85%', borderRadius: '4px' }} />
      <div className="shimmer-bg" style={{ height: '14px', width: '65%', borderRadius: '4px' }} />
    </div>
  );
};
