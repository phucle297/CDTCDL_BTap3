'use client';

import { useDrawingStore } from '@/store/useDrawingStore';
import styles from './PropertyPanel.module.css';

export function PropertyPanel() {
  const shapes = useDrawingStore((state) => state.shapes);
  const selectedIds = useDrawingStore((state) => state.selectedIds);

  const selectedShape = selectedIds.length > 0
    ? shapes.find((s) => s.id === selectedIds[0])
    : undefined;

  return (
    <div
      data-testid="property-panel"
      className={styles.panel}
    >
      {!selectedShape ? (
        <p className={styles.noSelection}>
          No Selection
        </p>
      ) : (
        <div>
          <h2 className={styles.heading}>Properties</h2>
          <p className={styles.shapeType}>
            {selectedShape.type}
          </p>
          <div className={styles.field}>
            <label htmlFor="stroke-color" className={styles.label}>Stroke Color</label>
            <input
              id="stroke-color"
              type="color"
              value={selectedShape.style.stroke ?? '#000000'}
              readOnly
              className={styles.colorInput}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="fill-color" className={styles.label}>Fill Color</label>
            <input
              id="fill-color"
              type="color"
              value={selectedShape.style.fill ?? '#000000'}
              readOnly
              className={styles.colorInput}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="stroke-width" className={styles.label}>Stroke Width</label>
            <input
              id="stroke-width"
              type="number"
              value={selectedShape.style.strokeWidth ?? 1}
              readOnly
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="opacity" className={styles.label}>Opacity</label>
            <input
              id="opacity"
              type="number"
              value={selectedShape.style.opacity ?? 1}
              readOnly
              className={styles.input}
            />
          </div>
        </div>
      )}
    </div>
  );
}
