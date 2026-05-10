'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useDrawingStore } from '@/store/useDrawingStore';
import type { RectShape, CircleShape, EllipseShape, LineShape, TextShape, Shape } from '@/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_ZOOM_WIDTH, MAX_ZOOM_WIDTH } from '@/constants';
import styles from './Canvas.module.css';
import { StatusBar } from './StatusBar';

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface DragState {
  isDragging: boolean;
  shapeId: string;
  startX: number;
  startY: number;
  originalShape: Shape | null;
}

const DEFAULT_STYLE = {
  fill: 'none',
  stroke: '#000000',
  strokeWidth: 2,
  opacity: 1,
};

export function Canvas() {
  const shapes = useDrawingStore((state) => state.shapes);
  const selectedIds = useDrawingStore((state) => state.selectedIds);
  const activeTool = useDrawingStore((state) => state.activeTool);
  const addShape = useDrawingStore((state) => state.addShape);
  const updateShape = useDrawingStore((state) => state.updateShape);
  const setSelectedIds = useDrawingStore((state) => state.setSelectedIds);
  const clearSelection = useDrawingStore((state) => state.clearSelection);
  const viewBox = useDrawingStore((state) => state.viewBox);
  const setViewBox = useDrawingStore((state) => state.setViewBox);
  const commitHistory = useDrawingStore((state) => state.commitHistory);

  const svgRef = useRef<SVGSVGElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const mouseCoordsRef = useRef({ x: 0, y: 0 });

  const [drawing, setDrawing] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const [drag, setDrag] = useState<DragState>({
    isDragging: false,
    shapeId: '',
    startX: 0,
    startY: 0,
    originalShape: null,
  });

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextOriginal, setEditingTextOriginal] = useState<string>('');
  const [mouseCoords, setMouseCoords] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const cursorPixelX = e.clientX - rect.left;
      const cursorPixelY = e.clientY - rect.top;
      const cursorSvgX = viewBox.x + (cursorPixelX / rect.width) * viewBox.width;
      const cursorSvgY = viewBox.y + (cursorPixelY / rect.height) * viewBox.height;

      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      const newWidth = Math.max(
        MIN_ZOOM_WIDTH,
        Math.min(MAX_ZOOM_WIDTH, viewBox.width * zoomFactor)
      );
      const newHeight = Math.max(
        MIN_ZOOM_WIDTH * 0.75,
        Math.min(MAX_ZOOM_WIDTH * 0.75, viewBox.height * zoomFactor)
      );
      const newX = cursorSvgX - (cursorPixelX / rect.width) * newWidth;
      const newY = cursorSvgY - (cursorPixelY / rect.height) * newHeight;
      setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
    },
    [viewBox, setViewBox]
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  function getMousePosition(e: React.MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: e.clientX, y: e.clientY };
    const rect = svg.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    if (rect.width === 0 || rect.height === 0) {
      return { x: pixelX, y: pixelY };
    }
    return {
      x: viewBox.x + (pixelX / rect.width) * viewBox.width,
      y: viewBox.y + (pixelY / rect.height) * viewBox.height,
    };
  }

  // --- Select mode handlers ---

  function handleShapeMouseDown(e: React.MouseEvent, shapeId: string) {
    if (activeTool !== 'select') return;
    e.stopPropagation();

    const { x, y } = getMousePosition(e);
    const currentShapes = useDrawingStore.getState().shapes;
    const shape = currentShapes.find((s) => s.id === shapeId) ?? null;

    commitHistory();
    setSelectedIds([shapeId]);
    setDrag({
      isDragging: true,
      shapeId,
      startX: x,
      startY: y,
      originalShape: shape,
    });
  }

  function handleShapeDoubleClick(e: React.MouseEvent, shapeId: string) {
    if (activeTool !== 'select') return;
    const currentShapes = useDrawingStore.getState().shapes;
    const shape = currentShapes.find((s) => s.id === shapeId);
    if (!shape || shape.type !== 'text') return;
    const textShape = shape as TextShape;
    setEditingTextId(shapeId);
    setEditingTextOriginal(textShape.content);
  }

  function handleBackgroundMouseDown(_e: React.MouseEvent) {
    if (activeTool !== 'select') return;
    clearSelection();
  }

  function handleSelectMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!drag.isDragging || !drag.originalShape) return;
    const { x, y } = getMousePosition(e);
    const dx = x - drag.startX;
    const dy = y - drag.startY;
    const orig = drag.originalShape;

    if (orig.type === 'rect') {
      const s = orig as RectShape;
      updateShape(drag.shapeId, { x: s.x + dx, y: s.y + dy });
    } else if (orig.type === 'ellipse') {
      const s = orig as EllipseShape;
      updateShape(drag.shapeId, { cx: s.cx + dx, cy: s.cy + dy });
    } else if (orig.type === 'line') {
      const s = orig as LineShape;
      updateShape(drag.shapeId, {
        x1: s.x1 + dx,
        y1: s.y1 + dy,
        x2: s.x2 + dx,
        y2: s.y2 + dy,
      });
    } else if (orig.type === 'text') {
      const s = orig as TextShape;
      updateShape(drag.shapeId, { x: s.x + dx, y: s.y + dy });
    }
  }

  function handleSelectMouseUp(_e: React.MouseEvent<SVGSVGElement>) {
    if (drag.isDragging) {
      setDrag({
        isDragging: false,
        shapeId: '',
        startX: 0,
        startY: 0,
        originalShape: null,
      });
    }
  }

  // --- Drawing mode handlers ---

  function handleDrawMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (!['rect', 'ellipse', 'line', 'text'].includes(activeTool)) return;
    const { x, y } = getMousePosition(e);
    setDrawing({
      isDrawing: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  }

  function handleDrawMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!drawing.isDrawing) return;
    const { x, y } = getMousePosition(e);
    setDrawing((prev) => ({ ...prev, currentX: x, currentY: y }));
  }

  function handleDrawMouseUp(e: React.MouseEvent<SVGSVGElement>) {
    if (!drawing.isDrawing) return;
    const { x, y } = getMousePosition(e);
    const { startX, startY } = drawing;
    const currentX = x;
    const currentY = y;

    setDrawing({
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });

    if (activeTool === 'text') {
      addShape({
        id: crypto.randomUUID(),
        type: 'text',
        x: startX,
        y: startY,
        content: 'Text',
        fontSize: 16,
        style: { ...DEFAULT_STYLE, fill: '#000000', strokeWidth: 1 },
      } as TextShape);
      return;
    }

    if (activeTool === 'rect') {
      const rx = Math.min(startX, currentX);
      const ry = Math.min(startY, currentY);
      const rw = Math.abs(currentX - startX);
      const rh = Math.abs(currentY - startY);
      if (rw === 0 && rh === 0) return;
      addShape({
        id: crypto.randomUUID(),
        type: 'rect',
        x: rx,
        y: ry,
        width: rw,
        height: rh,
        style: { ...DEFAULT_STYLE },
      } as RectShape);
      return;
    }

    if (activeTool === 'ellipse') {
      const rx = Math.abs(currentX - startX) / 2;
      const ry = Math.abs(currentY - startY) / 2;
      if (rx === 0 && ry === 0) return;
      const cx = (startX + currentX) / 2;
      const cy = (startY + currentY) / 2;
      addShape({
        id: crypto.randomUUID(),
        type: 'ellipse',
        cx,
        cy,
        rx,
        ry,
        style: { ...DEFAULT_STYLE },
      } as EllipseShape);
      return;
    }

    if (activeTool === 'line') {
      if (startX === currentX && startY === currentY) return;
      addShape({
        id: crypto.randomUUID(),
        type: 'line',
        x1: startX,
        y1: startY,
        x2: currentX,
        y2: currentY,
        style: { ...DEFAULT_STYLE },
      } as LineShape);
    }
  }

  // --- Unified SVG event handlers ---

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (activeTool === 'select') {
      // Background click handled by background element's own handler
      // Shape clicks handled by shape element handlers (with stopPropagation)
      // If we reach here in select mode, it's a background click
      handleBackgroundMouseDown(e);
    } else {
      handleDrawMouseDown(e);
    }
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const pos = getMousePosition(e);
    mouseCoordsRef.current = { x: pos.x, y: pos.y };
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        setMouseCoords(mouseCoordsRef.current);
        rafIdRef.current = null;
      });
    }
    if (activeTool === 'select') {
      handleSelectMouseMove(e);
    } else {
      handleDrawMouseMove(e);
    }
  }

  function handleMouseUp(e: React.MouseEvent<SVGSVGElement>) {
    if (activeTool === 'select') {
      handleSelectMouseUp(e);
    } else {
      handleDrawMouseUp(e);
    }
  }

  // --- Rendering ---

  function renderSelectionIndicator(shape: Shape) {
    const baseStyle = {
      fill: 'none' as const,
      stroke: 'blue',
      strokeDasharray: '4',
      strokeWidth: 1,
      pointerEvents: 'none' as const,
    };

    switch (shape.type) {
      case 'rect': {
        const s = shape as RectShape;
        return (
          <rect
            key={`sel-${shape.id}`}
            data-selection-indicator={shape.id}
            x={s.x}
            y={s.y}
            width={s.width}
            height={s.height}
            {...baseStyle}
          />
        );
      }
      case 'ellipse': {
        const s = shape as EllipseShape;
        return (
          <rect
            key={`sel-${shape.id}`}
            data-selection-indicator={shape.id}
            x={s.cx - s.rx}
            y={s.cy - s.ry}
            width={s.rx * 2}
            height={s.ry * 2}
            {...baseStyle}
          />
        );
      }
      case 'line': {
        const s = shape as LineShape;
        const minX = Math.min(s.x1, s.x2);
        const minY = Math.min(s.y1, s.y2);
        const w = Math.abs(s.x2 - s.x1);
        const h = Math.abs(s.y2 - s.y1);
        return (
          <rect
            key={`sel-${shape.id}`}
            data-selection-indicator={shape.id}
            x={minX}
            y={minY}
            width={w || 4}
            height={h || 4}
            {...baseStyle}
          />
        );
      }
      case 'text': {
        const s = shape as TextShape;
        const fs = s.fontSize ?? 16;
        return (
          <rect
            key={`sel-${shape.id}`}
            data-selection-indicator={shape.id}
            x={s.x}
            y={s.y - fs}
            width={s.content.length * fs * 0.6}
            height={fs * 1.2}
            {...baseStyle}
          />
        );
      }
      default:
        return null;
    }
  }

  function renderShape(shape: Shape) {
    const { id, style } = shape;
    const common = {
      'data-shape-id': id,
      fill: style.fill,
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
      opacity: style.opacity,
      onMouseDown: (e: React.MouseEvent) => handleShapeMouseDown(e, id),
      onDoubleClick: (e: React.MouseEvent) => handleShapeDoubleClick(e, id),
    };

    switch (shape.type) {
      case 'rect': {
        const s = shape as RectShape;
        return <rect key={id} {...common} x={s.x} y={s.y} width={s.width} height={s.height} />;
      }
      case 'circle': {
        const s = shape as CircleShape;
        return <circle key={id} {...common} cx={s.cx} cy={s.cy} r={s.r} />;
      }
      case 'ellipse': {
        const s = shape as EllipseShape;
        return <ellipse key={id} {...common} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
      }
      case 'line': {
        const s = shape as LineShape;
        return <line key={id} {...common} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />;
      }
      case 'text': {
        const s = shape as TextShape;
        // If this text is being edited, render foreignObject instead
        if (editingTextId === id) {
          const fs = s.fontSize ?? 16;
          const estimatedWidth = Math.max(s.content.length * fs * 0.7, 100);
          return (
            <foreignObject
              key={id}
              x={s.x - 4}
              y={s.y - fs - 4}
              width={estimatedWidth + 16}
              height={fs * 2 + 16}
            >
              <textarea
                defaultValue={editingTextOriginal}
                className={styles.textEditTextarea}
                style={{ fontSize: fs }}
                onChange={(e) => {
                  updateShape(id, { content: e.target.value });
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setEditingTextId(null);
                  } else if (e.key === 'Escape') {
                    updateShape(id, { content: editingTextOriginal });
                    setEditingTextId(null);
                  }
                }}
                onBlur={() => {
                  setEditingTextId(null);
                }}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </foreignObject>
          );
        }
        return (
          <text key={id} {...common} x={s.x} y={s.y} fontSize={s.fontSize} fontWeight="normal">
            {s.content}
          </text>
        );
      }
      default:
        return null;
    }
  }

  function renderPreview() {
    if (!drawing.isDrawing) return null;
    const { startX, startY, currentX, currentY } = drawing;
    const previewStyle = {
      fill: 'none',
      stroke: '#000000',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      opacity: 0.5,
    };

    if (activeTool === 'rect') {
      const rx = Math.min(startX, currentX);
      const ry = Math.min(startY, currentY);
      const rw = Math.abs(currentX - startX);
      const rh = Math.abs(currentY - startY);
      return <rect data-preview="true" x={rx} y={ry} width={rw} height={rh} {...previewStyle} />;
    }

    if (activeTool === 'ellipse') {
      const erx = Math.abs(currentX - startX) / 2;
      const ery = Math.abs(currentY - startY) / 2;
      const cx = (startX + currentX) / 2;
      const cy = (startY + currentY) / 2;
      return <ellipse data-preview="true" cx={cx} cy={cy} rx={erx} ry={ery} {...previewStyle} />;
    }

    if (activeTool === 'line') {
      return (
        <line
          data-preview="true"
          x1={startX}
          y1={startY}
          x2={currentX}
          y2={currentY}
          {...previewStyle}
        />
      );
    }

    return null;
  }

  return (
    <div data-testid="canvas-wrapper" className={styles.wrapper}>
      <div className={styles.canvasContainer}>
        <svg
          ref={svgRef}
          role="img"
          aria-label="Drawing canvas"
          data-testid="svg-canvas"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          preserveAspectRatio="none"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setMouseCoords({ x: null, y: null })}
        >
          <rect
            x="0"
            y="0"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="white"
            data-background="true"
            onMouseDown={activeTool === 'select' ? handleBackgroundMouseDown : undefined}
          />
          {shapes.map(renderShape)}
          {shapes.filter((s) => selectedIds.includes(s.id)).map(renderSelectionIndicator)}
          {renderPreview()}
        </svg>
        <StatusBar x={mouseCoords.x} y={mouseCoords.y} />
      </div>
    </div>
  );
}
