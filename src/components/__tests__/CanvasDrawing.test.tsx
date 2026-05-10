import { render, screen, fireEvent } from '@testing-library/react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { Canvas } from '../Canvas';
import type { RectShape, EllipseShape, LineShape, TextShape } from '@/types';

function getSvg() {
  return screen.getByTestId('svg-canvas');
}

function mockSvgBoundingRect(svg: Element) {
  (svg as SVGSVGElement).getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    toJSON: () => ({}),
  });
}

function dragOnCanvas(
  svg: Element,
  start: { clientX: number; clientY: number },
  end: { clientX: number; clientY: number },
) {
  fireEvent.mouseDown(svg, start);
  fireEvent.mouseMove(svg, end);
  fireEvent.mouseUp(svg, end);
}

describe('Canvas Drawing — Phase 3', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [],
      selectedIds: [],
      activeTool: 'select',
    });
  });

  describe('US-011: Draw Rectangle', () => {
    beforeEach(() => {
      useDrawingStore.getState().setActiveTool('rect');
    });

    it('commits a RectShape to store on drag', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 100, clientY: 100 }, { clientX: 250, clientY: 200 });

      const shapes = useDrawingStore.getState().shapes;
      expect(shapes).toHaveLength(1);
      const shape = shapes[0] as RectShape;
      expect(shape.type).toBe('rect');
      expect(shape.x).toBe(100);
      expect(shape.y).toBe(100);
      expect(shape.width).toBe(150);
      expect(shape.height).toBe(100);
    });

    it('normalizes coords when dragging left/up', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 300, clientY: 300 }, { clientX: 100, clientY: 150 });

      const shapes = useDrawingStore.getState().shapes;
      expect(shapes).toHaveLength(1);
      const shape = shapes[0] as RectShape;
      expect(shape.x).toBe(100);
      expect(shape.y).toBe(150);
      expect(shape.width).toBe(200);
      expect(shape.height).toBe(150);
    });

    it('shape has unique id', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 10, clientY: 10 }, { clientX: 60, clientY: 60 });
      dragOnCanvas(svg, { clientX: 100, clientY: 100 }, { clientX: 200, clientY: 200 });

      const shapes = useDrawingStore.getState().shapes;
      expect(shapes).toHaveLength(2);
      expect(shapes[0].id).not.toBe(shapes[1].id);
    });

    it('applies default style from store', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 10, clientY: 10 }, { clientX: 60, clientY: 60 });

      const shape = useDrawingStore.getState().shapes[0];
      expect(shape.style).toBeDefined();
      expect(shape.style.stroke).toBeDefined();
      expect(shape.style.strokeWidth).toBeDefined();
    });

    it('renders preview rect during drag (not in store)', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(svg, { clientX: 150, clientY: 120 });

      // Preview visible in SVG
      const previewRect = svg.querySelector('rect[data-preview="true"]');
      expect(previewRect).not.toBeNull();

      // Not in store yet
      expect(useDrawingStore.getState().shapes).toHaveLength(0);

      fireEvent.mouseUp(svg, { clientX: 150, clientY: 120 });

      // Now in store
      expect(useDrawingStore.getState().shapes).toHaveLength(1);
    });

    it('does not commit shape with zero size', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 100, clientY: 100 }, { clientX: 100, clientY: 100 });

      expect(useDrawingStore.getState().shapes).toHaveLength(0);
    });
  });

  describe('US-012: Draw Ellipse', () => {
    beforeEach(() => {
      useDrawingStore.getState().setActiveTool('ellipse');
    });

    it('commits an EllipseShape to store on drag', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 100, clientY: 100 }, { clientX: 300, clientY: 200 });

      const shapes = useDrawingStore.getState().shapes;
      expect(shapes).toHaveLength(1);
      const shape = shapes[0] as EllipseShape;
      expect(shape.type).toBe('ellipse');
      expect(shape.cx).toBe(200);
      expect(shape.cy).toBe(150);
      expect(shape.rx).toBe(100);
      expect(shape.ry).toBe(50);
    });

    it('rx/ry always positive regardless of drag direction', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 300, clientY: 300 }, { clientX: 100, clientY: 150 });

      const shape = useDrawingStore.getState().shapes[0] as EllipseShape;
      expect(shape.rx).toBeGreaterThan(0);
      expect(shape.ry).toBeGreaterThan(0);
    });

    it('renders preview ellipse during drag', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(svg, { clientX: 200, clientY: 150 });

      const previewEllipse = svg.querySelector('ellipse[data-preview="true"]');
      expect(previewEllipse).not.toBeNull();
      expect(useDrawingStore.getState().shapes).toHaveLength(0);
    });

    it('does not commit ellipse with zero radii', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 100, clientY: 100 }, { clientX: 100, clientY: 100 });

      expect(useDrawingStore.getState().shapes).toHaveLength(0);
    });
  });

  describe('US-013: Draw Line', () => {
    beforeEach(() => {
      useDrawingStore.getState().setActiveTool('line');
    });

    it('commits a LineShape to store on drag', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 50, clientY: 50 }, { clientX: 200, clientY: 300 });

      const shapes = useDrawingStore.getState().shapes;
      expect(shapes).toHaveLength(1);
      const shape = shapes[0] as LineShape;
      expect(shape.type).toBe('line');
      expect(shape.x1).toBe(50);
      expect(shape.y1).toBe(50);
      expect(shape.x2).toBe(200);
      expect(shape.y2).toBe(300);
    });

    it('line preserves direction (no normalization)', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 300, clientY: 300 }, { clientX: 100, clientY: 50 });

      const shape = useDrawingStore.getState().shapes[0] as LineShape;
      expect(shape.x1).toBe(300);
      expect(shape.y1).toBe(300);
      expect(shape.x2).toBe(100);
      expect(shape.y2).toBe(50);
    });

    it('renders preview line during drag', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      fireEvent.mouseDown(svg, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(svg, { clientX: 200, clientY: 200 });

      const previewLine = svg.querySelector('line[data-preview="true"]');
      expect(previewLine).not.toBeNull();
      expect(useDrawingStore.getState().shapes).toHaveLength(0);
    });

    it('does not commit line with zero length', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 100, clientY: 100 }, { clientX: 100, clientY: 100 });

      expect(useDrawingStore.getState().shapes).toHaveLength(0);
    });
  });

  describe('US-050: Add Text', () => {
    beforeEach(() => {
      useDrawingStore.getState().setActiveTool('text');
    });

    it('places a TextShape on single click', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      fireEvent.mouseDown(svg, { clientX: 150, clientY: 200 });
      fireEvent.mouseUp(svg, { clientX: 150, clientY: 200 });

      const shapes = useDrawingStore.getState().shapes;
      expect(shapes).toHaveLength(1);
      const shape = shapes[0] as TextShape;
      expect(shape.type).toBe('text');
      expect(shape.x).toBe(150);
      expect(shape.y).toBe(200);
    });

    it('default content is "Text"', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
      fireEvent.mouseUp(svg, { clientX: 50, clientY: 50 });

      const shape = useDrawingStore.getState().shapes[0] as TextShape;
      expect(shape.content).toBe('Text');
    });

    it('default fontSize is 16', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
      fireEvent.mouseUp(svg, { clientX: 50, clientY: 50 });

      const shape = useDrawingStore.getState().shapes[0] as TextShape;
      expect(shape.fontSize).toBe(16);
    });

    it('applies default style', () => {
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
      fireEvent.mouseUp(svg, { clientX: 50, clientY: 50 });

      const shape = useDrawingStore.getState().shapes[0];
      expect(shape.style).toBeDefined();
    });
  });

  describe('General drawing behavior', () => {
    it('does nothing on drag when tool is select', () => {
      useDrawingStore.getState().setActiveTool('select');
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 10, clientY: 10 }, { clientX: 200, clientY: 200 });

      expect(useDrawingStore.getState().shapes).toHaveLength(0);
    });

    it('preview disappears after mouseUp', () => {
      useDrawingStore.getState().setActiveTool('rect');
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(svg, { clientX: 150, clientY: 120 });
      fireEvent.mouseUp(svg, { clientX: 150, clientY: 120 });

      const preview = svg.querySelector('[data-preview="true"]');
      expect(preview).toBeNull();
    });

    it('committed shapes render in SVG', () => {
      useDrawingStore.getState().setActiveTool('rect');
      render(<Canvas />);
      const svg = getSvg();
      mockSvgBoundingRect(svg);

      dragOnCanvas(svg, { clientX: 10, clientY: 10 }, { clientX: 110, clientY: 110 });

      const shapeEls = svg.querySelectorAll('[data-shape-id]');
      expect(shapeEls).toHaveLength(1);
    });
  });
});
