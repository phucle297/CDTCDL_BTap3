import { calculateZoomToFit } from '../zoomToFit';
import type { RectShape, EllipseShape, LineShape } from '@/types';

const makeRect = (x: number, y: number, w: number, h: number): RectShape => ({
  id: `rect-${x}-${y}`,
  type: 'rect',
  x,
  y,
  width: w,
  height: h,
  style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
});

const makeEllipse = (cx: number, cy: number, rx: number, ry: number): EllipseShape => ({
  id: `ellipse-${cx}-${cy}`,
  type: 'ellipse',
  cx,
  cy,
  rx,
  ry,
  style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
});

const makeLine = (x1: number, y1: number, x2: number, y2: number): LineShape => ({
  id: `line-${x1}-${y1}`,
  type: 'line',
  x1,
  y1,
  x2,
  y2,
  style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
});

describe('calculateZoomToFit', () => {
  it('returns default viewBox when shapes array is empty', () => {
    const result = calculateZoomToFit([], 800, 600);
    expect(result).toEqual({ x: 0, y: 0, width: 800, height: 600 });
  });

  it('preserves canvas aspect ratio for a single rectangle', () => {
    const shapes = [makeRect(100, 100, 200, 150)];
    const result = calculateZoomToFit(shapes, 800, 600, 20);
    expect(result.width / result.height).toBeCloseTo(800 / 600, 5);
    // Content (80..320, 80..270) must be inside viewBox
    expect(result.x).toBeLessThanOrEqual(80);
    expect(result.y).toBeLessThanOrEqual(80);
    expect(result.x + result.width).toBeGreaterThanOrEqual(320);
    expect(result.y + result.height).toBeGreaterThanOrEqual(270);
  });

  it('covers all shapes bounding box', () => {
    const shapes = [makeRect(10, 10, 50, 50), makeRect(200, 300, 100, 80)];
    const result = calculateZoomToFit(shapes, 800, 600, 20);
    // Content with padding: (-10..320, -10..400)
    expect(result.x).toBeLessThanOrEqual(-10);
    expect(result.y).toBeLessThanOrEqual(-10);
    expect(result.x + result.width).toBeGreaterThanOrEqual(320);
    expect(result.y + result.height).toBeGreaterThanOrEqual(400);
    expect(result.width / result.height).toBeCloseTo(800 / 600, 5);
  });

  it('handles ellipse shapes correctly', () => {
    const shapes = [makeEllipse(150, 150, 50, 30)];
    const result = calculateZoomToFit(shapes, 800, 600, 20);
    // Bounding box with padding: (80..220, 100..200)
    expect(result.x).toBeLessThanOrEqual(80);
    expect(result.y).toBeLessThanOrEqual(100);
    expect(result.x + result.width).toBeGreaterThanOrEqual(220);
    expect(result.y + result.height).toBeGreaterThanOrEqual(200);
    expect(result.width / result.height).toBeCloseTo(800 / 600, 5);
  });

  it('handles line shapes correctly', () => {
    const shapes = [makeLine(50, 50, 250, 350)];
    const result = calculateZoomToFit(shapes, 800, 600, 20);
    // Bounding box with padding: (30..270, 30..370)
    expect(result.x).toBeLessThanOrEqual(30);
    expect(result.y).toBeLessThanOrEqual(30);
    expect(result.x + result.width).toBeGreaterThanOrEqual(270);
    expect(result.y + result.height).toBeGreaterThanOrEqual(370);
    expect(result.width / result.height).toBeCloseTo(800 / 600, 5);
  });

  it('content with matching aspect ratio uses exact bounds', () => {
    // 200x150 = 4:3 = same as 800:600
    const shapes = [makeRect(100, 100, 200, 150)];
    const result = calculateZoomToFit(shapes, 800, 600);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
    expect(result.width).toBe(200);
    expect(result.height).toBe(150);
  });
});
