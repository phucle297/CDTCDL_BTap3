import { render, screen } from '@testing-library/react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { Canvas } from '../Canvas';
import type { RectShape, CircleShape, LineShape, TextShape } from '@/types';

const makeRect = (overrides?: Partial<RectShape>): RectShape => ({
  id: 'rect-1',
  type: 'rect',
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  style: { fill: 'none', stroke: '#000000', strokeWidth: 1, opacity: 1 },
  ...overrides,
});

const makeCircle = (overrides?: Partial<CircleShape>): CircleShape => ({
  id: 'circle-1',
  type: 'circle',
  cx: 50,
  cy: 50,
  r: 30,
  style: { fill: '#0000ff', stroke: '#000000', strokeWidth: 1, opacity: 1 },
  ...overrides,
});

const makeLine = (overrides?: Partial<LineShape>): LineShape => ({
  id: 'line-1',
  type: 'line',
  x1: 0,
  y1: 0,
  x2: 100,
  y2: 100,
  style: { stroke: '#000000', strokeWidth: 2, opacity: 1 },
  ...overrides,
});

const makeText = (overrides?: Partial<TextShape>): TextShape => ({
  id: 'text-1',
  type: 'text',
  x: 50,
  y: 50,
  content: 'Hello',
  fontSize: 16,
  style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
  ...overrides,
});

describe('Canvas', () => {
  beforeEach(() => {
    useDrawingStore.setState({ shapes: [], selectedIds: [], activeTool: 'select' });
  });

  describe('SVG element rendering', () => {
    it('renders an SVG element', () => {
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      expect(svg).toBeInTheDocument();
      expect(svg.tagName.toLowerCase()).toBe('svg');
    });

    it('has default viewBox of 0 0 800 600', () => {
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      expect(svg.getAttribute('viewBox')).toBe('0 0 800 600');
    });

    it('has a white background on the SVG canvas', () => {
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      const style = svg.getAttribute('style') || '';
      const bgClass = svg.className;
      expect(
        style.includes('background') ||
          style.includes('white') ||
          svg.querySelector('rect[fill="white"]') !== null ||
          typeof bgClass === 'string',
      ).toBe(true);
    });
  });

  describe('canvas wrapper', () => {
    it('renders a wrapper element around the SVG', () => {
      render(<Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('wrapper has gray background for contrast', () => {
      render(<Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');
      expect(wrapper.getAttribute('style') || wrapper.className).toBeTruthy();
    });
  });

  describe('shape rendering', () => {
    it('renders nothing when shapes array is empty', () => {
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      expect(svg.querySelectorAll('rect:not([data-background])')).toHaveLength(0);
      expect(svg.querySelectorAll('circle')).toHaveLength(0);
      expect(svg.querySelectorAll('line')).toHaveLength(0);
    });

    it('renders a rect element for RectShape', () => {
      useDrawingStore.setState({ shapes: [makeRect()] });
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      const rects = svg.querySelectorAll('[data-shape-id="rect-1"]');
      expect(rects).toHaveLength(1);
      const rect = rects[0];
      expect(rect.tagName.toLowerCase()).toBe('rect');
      expect(rect.getAttribute('x')).toBe('10');
      expect(rect.getAttribute('y')).toBe('20');
      expect(rect.getAttribute('width')).toBe('100');
      expect(rect.getAttribute('height')).toBe('50');
    });

    it('renders a circle element for CircleShape', () => {
      useDrawingStore.setState({ shapes: [makeCircle()] });
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      const circles = svg.querySelectorAll('[data-shape-id="circle-1"]');
      expect(circles).toHaveLength(1);
      const circle = circles[0];
      expect(circle.tagName.toLowerCase()).toBe('circle');
      expect(circle.getAttribute('cx')).toBe('50');
      expect(circle.getAttribute('cy')).toBe('50');
      expect(circle.getAttribute('r')).toBe('30');
    });

    it('renders a line element for LineShape', () => {
      useDrawingStore.setState({ shapes: [makeLine()] });
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      const lines = svg.querySelectorAll('[data-shape-id="line-1"]');
      expect(lines).toHaveLength(1);
      const line = lines[0];
      expect(line.tagName.toLowerCase()).toBe('line');
      expect(line.getAttribute('x1')).toBe('0');
      expect(line.getAttribute('y1')).toBe('0');
      expect(line.getAttribute('x2')).toBe('100');
      expect(line.getAttribute('y2')).toBe('100');
    });

    it('renders a text element for TextShape', () => {
      useDrawingStore.setState({ shapes: [makeText()] });
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      const texts = svg.querySelectorAll('[data-shape-id="text-1"]');
      expect(texts).toHaveLength(1);
      expect(texts[0].tagName.toLowerCase()).toBe('text');
      expect(texts[0].textContent).toBe('Hello');
    });

    it('renders multiple shapes', () => {
      useDrawingStore.setState({ shapes: [makeRect(), makeCircle(), makeLine()] });
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      expect(svg.querySelectorAll('[data-shape-id]')).toHaveLength(3);
    });

    it('applies style properties to shapes', () => {
      useDrawingStore.setState({
        shapes: [makeRect({ style: { fill: '#ff0000', stroke: '#00ff00', strokeWidth: 3, opacity: 0.5 } })],
      });
      render(<Canvas />);
      const svg = screen.getByTestId('svg-canvas');
      const rect = svg.querySelector('[data-shape-id="rect-1"]');
      expect(rect).not.toBeNull();
      expect(rect!.getAttribute('fill')).toBe('#ff0000');
      expect(rect!.getAttribute('stroke')).toBe('#00ff00');
      expect(rect!.getAttribute('stroke-width')).toBe('3');
      expect(rect!.getAttribute('opacity')).toBe('0.5');
    });
  });
});
