'use client';

import { useRef } from 'react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { exportSVG } from '@/utils/exportSVG';
import { importSVG } from '@/utils/importSVG';
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
  const shapes = useDrawingStore((state) => state.shapes);
  const loadShapes = useDrawingStore((state) => state.loadShapes);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = importSVG(reader.result as string);
        loadShapes(parsed);
      } catch (err) {
        window.alert(`Failed to open SVG: ${err instanceof Error ? err.message : err}`);
      }
    };
    reader.onerror = () => {
      window.alert('Failed to read file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    const svgString = exportSVG(shapes, 800, 600);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <button
        aria-label="Save SVG"
        onClick={handleSave}
        className={styles.toolButton}
      >
        Save
      </button>
      <input
        type="file"
        accept=".svg"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileOpen}
      />
      <button
        aria-label="Open SVG"
        onClick={() => {
          if (shapes.length > 0) {
            const confirmed = window.confirm(
              'Current canvas is not empty. Opening a new file will replace all existing shapes. Continue?'
            );
            if (!confirmed) return;
          }
          fileInputRef.current?.click();
        }}
        className={styles.toolButton}
      >
        Open
      </button>
    </div>
  );
}
