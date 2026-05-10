'use client';

import { useState, useRef } from 'react';
import { useDrawingStore } from '@/store/useDrawingStore';
import type { RectShape, CircleShape, EllipseShape, LineShape, TextShape, Shape } from '@/types';
import styles from './Canvas.module.css';

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const DEFAULT_STYLE = { fill: 'none', stroke: '#000000', strokeWidth: 2, opacity: 1 };

function renderShape(shape: Shape) {
  const { id, style } = shape;
  const common = {
    'data-shape-id': id,
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    opacity: style.opacity,
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
      return (
        <text key={id} {...common} x={s.x} y={s.y} fontSize={s.fontSize}>
          {s.content}
        </text>
      );
    }
    default:
      return null;
  }
}

export function Canvas() {
  const shapes = useDrawingStore((state) => state.shapes);
  const activeTool = useDrawingStore((state) => state.activeTool);
  const addShape = useDrawingStore((state) => state.addShape);

  const svgRef = useRef<SVGSVGElement>(null);

  const [drawing, setDrawing] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  function getMousePosition(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return { x: e.clientX, y: e.clientY };
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (!['rect', 'ellipse', 'line', 'text'].includes(activeTool)) return;
    const { x, y } = getMousePosition(e);
    setDrawing({ isDrawing: true, startX: x, startY: y, currentX: x, currentY: y });
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!drawing.isDrawing) return;
    const { x, y } = getMousePosition(e);
    setDrawing((prev) => ({ ...prev, currentX: x, currentY: y }));
  }

  function handleMouseUp(e: React.MouseEvent<SVGSVGElement>) {
    if (!drawing.isDrawing) return;
    const { x, y } = getMousePosition(e);
    const { startX, startY } = drawing;
    const currentX = x;
    const currentY = y;

    setDrawing({ isDrawing: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });

    if (activeTool === 'text') {
      addShape({
        id: crypto.randomUUID(),
        type: 'text',
        x: startX,
        y: startY,
        content: 'Text',
        fontSize: 16,
        style: { ...DEFAULT_STYLE },
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
      <svg
        ref={svgRef}
        data-testid="svg-canvas"
        viewBox="0 0 800 600"
        width="800"
        height="600"
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <rect x="0" y="0" width="800" height="600" fill="white" data-background="true" />
        {shapes.map(renderShape)}
        {renderPreview()}
      </svg>
    </div>
  );
}
