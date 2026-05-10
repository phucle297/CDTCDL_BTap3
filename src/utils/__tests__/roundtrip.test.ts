import { exportSVG } from '../exportSVG';
import { importSVG } from '../importSVG';
import type { Shape, RectShape, EllipseShape, LineShape, TextShape } from '@/types';

beforeEach(() => {
  let counter = 0;
  jest.spyOn(crypto, 'randomUUID').mockImplementation(() => `uuid-${++counter}`);
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe('SVG round-trip (export → import)', () => {
  it('preserves rectangle properties through round-trip', () => {
    const original: RectShape = {
      id: 'original-rect',
      type: 'rect',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 0.8 },
    };

    const svgString = exportSVG([original], 800, 600);
    const imported = importSVG(svgString);

    expect(imported).toHaveLength(1);
    const rect = imported[0] as RectShape;
    expect(rect.type).toBe('rect');
    expect(rect.x).toBe(original.x);
    expect(rect.y).toBe(original.y);
    expect(rect.width).toBe(original.width);
    expect(rect.height).toBe(original.height);
    expect(rect.style.fill).toBe(original.style.fill);
    expect(rect.style.stroke).toBe(original.style.stroke);
    expect(rect.style.strokeWidth).toBe(original.style.strokeWidth);
    expect(rect.style.opacity).toBe(original.style.opacity);
  });

  it('preserves ellipse properties through round-trip', () => {
    const original: EllipseShape = {
      id: 'original-ellipse',
      type: 'ellipse',
      cx: 150,
      cy: 100,
      rx: 80,
      ry: 40,
      style: { fill: '#00ff00', stroke: '#333333', strokeWidth: 1, opacity: 1 },
    };

    const svgString = exportSVG([original], 800, 600);
    const imported = importSVG(svgString);

    expect(imported).toHaveLength(1);
    const ellipse = imported[0] as EllipseShape;
    expect(ellipse.cx).toBe(original.cx);
    expect(ellipse.cy).toBe(original.cy);
    expect(ellipse.rx).toBe(original.rx);
    expect(ellipse.ry).toBe(original.ry);
  });

  it('preserves line properties through round-trip', () => {
    const original: LineShape = {
      id: 'original-line',
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 200,
      y2: 150,
      style: { fill: 'none', stroke: '#0000ff', strokeWidth: 3, opacity: 1 },
    };

    const svgString = exportSVG([original], 800, 600);
    const imported = importSVG(svgString);

    expect(imported).toHaveLength(1);
    const line = imported[0] as LineShape;
    expect(line.x1).toBe(original.x1);
    expect(line.y1).toBe(original.y1);
    expect(line.x2).toBe(original.x2);
    expect(line.y2).toBe(original.y2);
    expect(line.style.stroke).toBe(original.style.stroke);
    expect(line.style.strokeWidth).toBe(original.style.strokeWidth);
  });

  it('preserves text properties including fontSize through round-trip', () => {
    const original: TextShape = {
      id: 'original-text',
      type: 'text',
      x: 50,
      y: 80,
      content: 'Hello World',
      fontSize: 24,
      fontFamily: 'Arial',
      style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
    };

    const svgString = exportSVG([original], 800, 600);
    const imported = importSVG(svgString);

    expect(imported).toHaveLength(1);
    const text = imported[0] as TextShape;
    expect(text.content).toBe(original.content);
    expect(text.fontSize).toBe(original.fontSize);
    expect(text.fontFamily).toBe(original.fontFamily);
    expect(text.style.fill).toBe(original.style.fill);
  });

  it('preserves all shapes in a mixed canvas through round-trip', () => {
    const shapes: Shape[] = [
      {
        id: 'r1', type: 'rect', x: 10, y: 20, width: 100, height: 50,
        style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 0.8 },
      },
      {
        id: 'e1', type: 'ellipse', cx: 150, cy: 100, rx: 80, ry: 40,
        style: { fill: '#00ff00', stroke: '#333333', strokeWidth: 1, opacity: 1 },
      },
      {
        id: 'l1', type: 'line', x1: 0, y1: 0, x2: 200, y2: 150,
        style: { fill: 'none', stroke: '#0000ff', strokeWidth: 3, opacity: 1 },
      },
      {
        id: 't1', type: 'text', x: 50, y: 80, content: 'Test', fontSize: 16,
        style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
      },
    ];

    const svgString = exportSVG(shapes, 1024, 768);
    const imported = importSVG(svgString);

    expect(imported).toHaveLength(4);
    expect(imported.map(s => s.type)).toEqual(['rect', 'ellipse', 'line', 'text']);
  });

  it('round-trip of empty canvas produces empty array', () => {
    const svgString = exportSVG([], 800, 600);
    const imported = importSVG(svgString);
    expect(imported).toHaveLength(0);
  });
});
