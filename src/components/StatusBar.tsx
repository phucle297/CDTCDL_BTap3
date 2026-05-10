'use client';

interface StatusBarProps {
  x: number | null;
  y: number | null;
}

export function StatusBar({ x, y }: StatusBarProps) {
  return (
    <div
      data-testid="status-bar"
      style={{
        display: 'flex',
        gap: '16px',
        padding: '4px 8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        backgroundColor: '#f0f0f0',
        borderTop: '1px solid #ccc',
        height: '24px',
        userSelect: 'none',
      }}
    >
      <span>X: {x !== null ? Math.round(x) : '—'}</span>
      <span>Y: {y !== null ? Math.round(y) : '—'}</span>
    </div>
  );
}
