import { exportSVG } from '../exportSVG';
import type { Shape, RectShape, EllipseShape, LineShape, TextShape } from '@/types';

function makeRect(overrides: Partial<RectShape> = {}): RectShape {
  return {
    id: 'rect-1',
    type: 'rect',
    x: 10,
    y: 20,
    width: 100,
    height: 50,
    style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 0.8 },
    ...overrides,
  };
}

function makeEllipse(overrides: Partial<EllipseShape> = {}): EllipseShape {
  return {
    id: 'ellipse-1',
    type: 'ellipse',
    cx: 150,
    cy: 100,
    rx: 80,
    ry: 40,
    style: { fill: '#00ff00', stroke: '#333333', strokeWidth: 1, opacity: 1 },
    ...overrides,
  };
}

function makeLine(overrides: Partial<LineShape> = {}): LineShape {
  return {
    id: 'line-1',
    type: 'line',
    x1: 0,
    y1: 0,
    x2: 200,
    y2: 150,
    style: { fill: 'none', stroke: '#0000ff', strokeWidth: 3, opacity: 1 },
    ...overrides,
  };
}

function makeText(overrides: Partial<TextShape> = {}): TextShape {
  return {
    id: 'text-1',
    type: 'text',
    x: 50,
    y: 80,
    content: 'Hello World',
    fontSize: 24,
    fontFamily: 'Arial',
    style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
    ...overrides,
  };
}

function parseSVG(svgString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(svgString, 'image/svg+xml');
}

describe('exportSVG', () => {
  it('returns valid SVG with xmlns and viewBox for empty shapes', () => {
    const result = exportSVG([], 800, 600);
    const doc = parseSVG(result);
    const svg = doc.documentElement;

    expect(svg.tagName).toBe('svg');
    expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 800 600');
    expect(svg.children.length).toBe(0);
  });

  it('exports rectangle with correct attributes', () => {
    const rect = makeRect();
    const result = exportSVG([rect], 800, 600);
    const doc = parseSVG(result);
    const el = doc.querySelector('rect')!;

    expect(el).not.toBeNull();
    expect(el.getAttribute('x')).toBe('10');
    expect(el.getAttribute('y')).toBe('20');
    expect(el.getAttribute('width')).toBe('100');
    expect(el.getAttribute('height')).toBe('50');
    expect(el.getAttribute('fill')).toBe('#ff0000');
    expect(el.getAttribute('stroke')).toBe('#000000');
    expect(el.getAttribute('stroke-width')).toBe('2');
    expect(el.getAttribute('opacity')).toBe('0.8');
  });

  it('exports ellipse with correct attributes', () => {
    const ellipse = makeEllipse();
    const result = exportSVG([ellipse], 800, 600);
    const doc = parseSVG(result);
    const el = doc.querySelector('ellipse')!;

    expect(el).not.toBeNull();
    expect(el.getAttribute('cx')).toBe('150');
    expect(el.getAttribute('cy')).toBe('100');
    expect(el.getAttribute('rx')).toBe('80');
    expect(el.getAttribute('ry')).toBe('40');
    expect(el.getAttribute('fill')).toBe('#00ff00');
    expect(el.getAttribute('stroke')).toBe('#333333');
    expect(el.getAttribute('stroke-width')).toBe('1');
    expect(el.getAttribute('opacity')).toBe('1');
  });

  it('exports line with correct attributes', () => {
    const line = makeLine();
    const result = exportSVG([line], 800, 600);
    const doc = parseSVG(result);
    const el = doc.querySelector('line')!;

    expect(el).not.toBeNull();
    expect(el.getAttribute('x1')).toBe('0');
    expect(el.getAttribute('y1')).toBe('0');
    expect(el.getAttribute('x2')).toBe('200');
    expect(el.getAttribute('y2')).toBe('150');
    expect(el.getAttribute('stroke')).toBe('#0000ff');
    expect(el.getAttribute('stroke-width')).toBe('3');
  });

  it('exports text with content and fontSize', () => {
    const text = makeText();
    const result = exportSVG([text], 800, 600);
    const doc = parseSVG(result);
    const el = doc.querySelector('text')!;

    expect(el).not.toBeNull();
    expect(el.getAttribute('x')).toBe('50');
    expect(el.getAttribute('y')).toBe('80');
    expect(el.textContent).toBe('Hello World');
    expect(el.getAttribute('font-size')).toBe('24');
    expect(el.getAttribute('font-family')).toBe('Arial');
    expect(el.getAttribute('fill')).toBe('#000000');
  });

  it('exports all shapes together with correct viewBox', () => {
    const shapes: Shape[] = [makeRect(), makeEllipse(), makeLine(), makeText()];
    const result = exportSVG(shapes, 1024, 768);
    const doc = parseSVG(result);
    const svg = doc.documentElement;

    expect(svg.getAttribute('viewBox')).toBe('0 0 1024 768');
    expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(doc.querySelectorAll('rect').length).toBe(1);
    expect(doc.querySelectorAll('ellipse').length).toBe(1);
    expect(doc.querySelectorAll('line').length).toBe(1);
    expect(doc.querySelectorAll('text').length).toBe(1);
  });

  it('handles shapes with missing optional style properties', () => {
    const rect = makeRect({ style: { fill: '#fff' } });
    const result = exportSVG([rect], 800, 600);
    const doc = parseSVG(result);
    const el = doc.querySelector('rect')!;

    expect(el).not.toBeNull();
    expect(el.getAttribute('fill')).toBe('#fff');
  });

  it('exports text without fontSize when not set', () => {
    const text = makeText({ fontSize: undefined, fontFamily: undefined });
    const result = exportSVG([text], 800, 600);
    const doc = parseSVG(result);
    const el = doc.querySelector('text')!;

    expect(el).not.toBeNull();
    expect(el.getAttribute('font-size')).toBeNull();
    expect(el.getAttribute('font-family')).toBeNull();
  });
});
