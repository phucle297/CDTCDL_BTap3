'use client';

import { useDrawingStore } from '@/store/useDrawingStore';
import type { ToolType } from '@/types';
import styles from './Toolbar.module.css';

const TOOLS: { label: string; tool: ToolType }[] = [
  { label: 'Select', tool: 'select' },
  { label: 'Rectangle', tool: 'rect' },
  { label: 'Ellipse', tool: 'ellipse' },
  { label: 'Line', tool: 'line' },
  { label: 'Text', tool: 'text' },
];

export function Toolbar() {
  const activeTool = useDrawingStore((state) => state.activeTool);
  const setActiveTool = useDrawingStore((state) => state.setActiveTool);

  return (
    <div
      role="toolbar"
      className={styles.toolbar}
    >
      {TOOLS.map(({ label, tool }) => (
        <button
          key={tool}
          aria-label={label}
          aria-pressed={activeTool === tool ? 'true' : 'false'}
          onClick={() => setActiveTool(tool)}
          className={`${styles.toolButton} ${activeTool === tool ? styles.toolButtonActive : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
