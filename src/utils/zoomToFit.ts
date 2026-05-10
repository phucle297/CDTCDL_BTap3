import type { Shape, RectShape, CircleShape, EllipseShape, LineShape, TextShape } from '@/types';

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateZoomToFit(
  shapes: Shape[],
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 0
): ViewBox {
  if (shapes.length === 0) {
    return { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const shape of shapes) {
    switch (shape.type) {
      case 'rect': {
        const s = shape as RectShape;
        minX = Math.min(minX, s.x);
        minY = Math.min(minY, s.y);
        maxX = Math.max(maxX, s.x + s.width);
        maxY = Math.max(maxY, s.y + s.height);
        break;
      }
      case 'circle': {
        const s = shape as CircleShape;
        minX = Math.min(minX, s.cx - s.r);
        minY = Math.min(minY, s.cy - s.r);
        maxX = Math.max(maxX, s.cx + s.r);
        maxY = Math.max(maxY, s.cy + s.r);
        break;
      }
      case 'ellipse': {
        const s = shape as EllipseShape;
        minX = Math.min(minX, s.cx - s.rx);
        minY = Math.min(minY, s.cy - s.ry);
        maxX = Math.max(maxX, s.cx + s.rx);
        maxY = Math.max(maxY, s.cy + s.ry);
        break;
      }
      case 'line': {
        const s = shape as LineShape;
        minX = Math.min(minX, s.x1, s.x2);
        minY = Math.min(minY, s.y1, s.y2);
        maxX = Math.max(maxX, s.x1, s.x2);
        maxY = Math.max(maxY, s.y1, s.y2);
        break;
      }
      case 'text': {
        const s = shape as TextShape;
        const fs = s.fontSize ?? 16;
        minX = Math.min(minX, s.x);
        minY = Math.min(minY, s.y - fs);
        maxX = Math.max(maxX, s.x + s.content.length * fs * 0.6);
        maxY = Math.max(maxY, s.y);
        break;
      }
    }
  }

  const contentW = maxX - minX + 2 * padding;
  const contentH = maxY - minY + 2 * padding;
  const canvasRatio = canvasWidth / canvasHeight;
  const contentRatio = contentW / contentH;

  let finalW: number;
  let finalH: number;
  if (contentRatio > canvasRatio) {
    finalW = contentW;
    finalH = contentW / canvasRatio;
  } else {
    finalH = contentH;
    finalW = contentH * canvasRatio;
  }

  const cx = minX + (maxX - minX) / 2;
  const cy = minY + (maxY - minY) / 2;

  return {
    x: cx - finalW / 2,
    y: cy - finalH / 2,
    width: finalW,
    height: finalH,
  };
}
