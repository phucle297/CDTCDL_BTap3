'use client';

import { useDrawingStore } from '@/store/useDrawingStore';
import type { TextShape } from '@/types';
import styles from './PropertyPanel.module.css';

export function PropertyPanel() {
  const shapes = useDrawingStore((state) => state.shapes);
  const selectedIds = useDrawingStore((state) => state.selectedIds);
  const defaultProperties = useDrawingStore((state) => state.defaultProperties);
  const updateShape = useDrawingStore((state) => state.updateShape);
  const deleteShape = useDrawingStore((state) => state.deleteShape);
  const clearSelection = useDrawingStore((state) => state.clearSelection);
  const setDefaultProperties = useDrawingStore((state) => state.setDefaultProperties);

  const selectedShape = selectedIds.length > 0
    ? shapes.find((s) => s.id === selectedIds[0])
    : undefined;

  const isTextShape = selectedShape?.type === 'text';
  const hasSelection = selectedShape !== undefined;

  const handleFillChange = (value: string) => {
    if (selectedShape) {
      updateShape(selectedShape.id, { style: { ...selectedShape.style, fill: value } });
    } else {
      setDefaultProperties({ fill: value });
    }
  };

  const handleStrokeChange = (value: string) => {
    if (selectedShape) {
      updateShape(selectedShape.id, { style: { ...selectedShape.style, stroke: value } });
    } else {
      setDefaultProperties({ stroke: value });
    }
  };

  const handleStrokeWidthChange = (value: string) => {
    if (selectedShape) {
      updateShape(selectedShape.id, { style: { ...selectedShape.style, strokeWidth: Number(value) } });
    } else {
      setDefaultProperties({ strokeWidth: Number(value) });
    }
  };

  const handleOpacityChange = (value: string) => {
    if (selectedShape) {
      updateShape(selectedShape.id, { style: { ...selectedShape.style, opacity: Number(value) } });
    } else {
      setDefaultProperties({ opacity: Number(value) });
    }
  };

  const handleFontSizeChange = (value: string) => {
    if (selectedShape && isTextShape) {
      updateShape(selectedShape.id, { fontSize: Number(value) });
    }
  };

  const handleDelete = () => {
    if (selectedShape) {
      deleteShape(selectedShape.id);
      clearSelection();
    }
  };

  const fillValue = hasSelection
    ? (selectedShape.style.fill ?? '#000000')
    : (defaultProperties?.fill ?? '#000000');

  const strokeValue = hasSelection
    ? (selectedShape.style.stroke ?? '#000000')
    : (defaultProperties?.stroke ?? '#000000');

  const strokeWidthValue = hasSelection
    ? (selectedShape.style.strokeWidth ?? 1)
    : (defaultProperties?.strokeWidth ?? 1);

  const opacityValue = hasSelection
    ? (selectedShape.style.opacity ?? 1)
    : (defaultProperties?.opacity ?? 1);

  const fontSizeValue = isTextShape
    ? ((selectedShape as TextShape).fontSize ?? 16)
    : 16;

  return (
    <div
      data-testid="property-panel"
      className={styles.panel}
    >
      {!hasSelection && (
        <p className={styles.noSelection}>
          No Selection
        </p>
      )}
      {hasSelection && (
        <div>
          <h2 className={styles.heading}>Properties</h2>
          <p className={styles.shapeType}>
            {selectedShape.type}
          </p>
        </div>
      )}
      <div className={styles.field}>
        <label htmlFor="fill-color" className={styles.label}>Fill Color</label>
        <input
          id="fill-color"
          type="color"
          value={fillValue}
          disabled={!hasSelection}
          onChange={(e) => handleFillChange(e.target.value)}
          className={styles.colorInput}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="stroke-color" className={styles.label}>Stroke Color</label>
        <input
          id="stroke-color"
          type="color"
          value={strokeValue}
          disabled={!hasSelection}
          onChange={(e) => handleStrokeChange(e.target.value)}
          className={styles.colorInput}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="stroke-width" className={styles.label}>Stroke Width</label>
        <input
          id="stroke-width"
          type="number"
          min={0}
          value={strokeWidthValue}
          disabled={!hasSelection}
          onChange={(e) => handleStrokeWidthChange(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="opacity" className={styles.label}>Opacity</label>
        <input
          id="opacity"
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={opacityValue}
          disabled={!hasSelection}
          onChange={(e) => handleOpacityChange(e.target.value)}
          className={styles.input}
        />
      </div>
      {isTextShape && (
        <div className={styles.field}>
          <label htmlFor="font-size" className={styles.label}>Font Size</label>
          <input
            id="font-size"
            type="number"
            min="8"
            max="200"
            value={fontSizeValue}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className={styles.input}
          />
        </div>
      )}
      {hasSelection && (
        <div className={styles.field}>
          <button
            aria-label="Delete"
            onClick={handleDelete}
            className={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
