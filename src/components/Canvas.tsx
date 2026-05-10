'use client';

import { useDrawingStore } from '@/store/useDrawingStore';
import type { RectShape, CircleShape, LineShape, TextShape, Shape } from '@/types';
import styles from './Canvas.module.css';

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
    case 'line': {
      const s = shape as LineShape;
      return <line key={id} {...common} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />;
    }
    case 'text': {
      const s = shape as TextShape;
      return (
        <text key={id} {...common} x={s.x} y={s.y}>
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

  return (
    <div
      data-testid="canvas-wrapper"
      className={styles.wrapper}
    >
      <svg
        data-testid="svg-canvas"
        viewBox="0 0 800 600"
        width="800"
        height="600"
        className={styles.canvas}
      >
        <rect x="0" y="0" width="800" height="600" fill="white" data-background="true" />
        {shapes.map(renderShape)}
      </svg>
    </div>
  );
}
