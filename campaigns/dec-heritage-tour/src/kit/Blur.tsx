import React, { useId } from 'react';
/** Directional (motion) blur via an inline SVG filter. Only applied while x/y > 0, so static frames stay sharp. */
export const Blur: React.FC<{ x?: number; y?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ x = 0, y = 0, style, children }) => {
  const id = 'mb' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const on = x > 0.15 || y > 0.15;
  return (
    <div style={{ ...style, filter: on ? `url(#${id})` : undefined }}>
      {on && (
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <defs><filter id={id} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} /></filter></defs>
        </svg>
      )}
      {children}
    </div>
  );
};
