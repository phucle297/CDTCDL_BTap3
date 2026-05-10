import { render, screen, fireEvent } from '@testing-library/react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { Canvas } from '../Canvas';
import type { RectShape, EllipseShape, LineShape, TextShape } from '@/types';

const makeRect = (overrides?: Partial<RectShape>): RectShape => ({
  id: 'rect-1',
  type: 'rect',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 1 },
  ...overrides,
});

const makeEllipse = (overrides?: Partial<EllipseShape>): EllipseShape => ({
  id: 'ellipse-1',
  type: 'ellipse',
  cx: 200,
  cy: 200,
  rx: 80,
  ry: 60,
  style: { fill: '#00ff00', stroke: '#000000', strokeWidth: 2, opacity: 1 },
  ...overrides,
});

const makeLine = (overrides?: Partial<LineShape>): LineShape => ({
  id: 'line-1',
  type: 'line',
  x1: 50,
  y1: 50,
  x2: 250,
  y2: 250,
  style: { fill: 'none', stroke: '#000000', strokeWidth: 2, opacity: 1 },
  ...overrides,
});

const makeText = (overrides?: Partial<TextShape>): TextShape => ({
  id: 'text-1',
  type: 'text',
  x: 300,
  y: 300,
  content: 'Hello',
  fontSize: 16,
  style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
  ...overrides,
});

function getMouseEvent(x: number, y: number) {
  return { clientX: x, clientY: y };
}

describe('Canvas Interactions - US-020: Select shape', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: [],
      activeTool: 'select',
    });
  });

  it('clicking a shape with select tool sets selectedIds to that shape', () => {
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const shape = svg.querySelector('[data-shape-id="rect-1"]')!;
    fireEvent.mouseDown(shape, getMouseEvent(150, 150));
    fireEvent.mouseUp(shape, getMouseEvent(150, 150));

    const state = useDrawingStore.getState();
    expect(state.selectedIds).toContain('rect-1');
  });

  it('clicking a different shape transfers selection', () => {
    useDrawingStore.setState({
      shapes: [makeRect(), makeEllipse()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const ellipse = svg.querySelector('[data-shape-id="ellipse-1"]')!;
    fireEvent.mouseDown(ellipse, getMouseEvent(200, 200));
    fireEvent.mouseUp(ellipse, getMouseEvent(200, 200));

    const state = useDrawingStore.getState();
    expect(state.selectedIds).toContain('ellipse-1');
    expect(state.selectedIds).not.toContain('rect-1');
  });

  it('does not select shape when tool is not select', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: [],
      activeTool: 'rect',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const shape = svg.querySelector('[data-shape-id="rect-1"]')!;
    fireEvent.mouseDown(shape, getMouseEvent(150, 150));
    fireEvent.mouseUp(shape, getMouseEvent(150, 150));

    const state = useDrawingStore.getState();
    expect(state.selectedIds).toHaveLength(0);
  });
});

describe('Canvas Interactions - US-021: Move shape', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
  });

  it('dragging a selected rect updates x and y', () => {
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const shape = svg.querySelector('[data-shape-id="rect-1"]')!;

    fireEvent.mouseDown(shape, getMouseEvent(150, 150));
    fireEvent.mouseMove(svg, getMouseEvent(200, 200));
    fireEvent.mouseUp(svg, getMouseEvent(200, 200));

    const state = useDrawingStore.getState();
    const moved = state.shapes.find((s) => s.id === 'rect-1') as RectShape;
    expect(moved.x).toBe(150);
    expect(moved.y).toBe(150);
  });

  it('dragging a selected ellipse updates cx and cy', () => {
    useDrawingStore.setState({
      shapes: [makeEllipse()],
      selectedIds: ['ellipse-1'],
      activeTool: 'select',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const shape = svg.querySelector('[data-shape-id="ellipse-1"]')!;

    fireEvent.mouseDown(shape, getMouseEvent(200, 200));
    fireEvent.mouseMove(svg, getMouseEvent(250, 230));
    fireEvent.mouseUp(svg, getMouseEvent(250, 230));

    const state = useDrawingStore.getState();
    const moved = state.shapes.find((s) => s.id === 'ellipse-1') as EllipseShape;
    expect(moved.cx).toBe(250);
    expect(moved.cy).toBe(230);
  });

  it('dragging a selected line translates both endpoints', () => {
    useDrawingStore.setState({
      shapes: [makeLine()],
      selectedIds: ['line-1'],
      activeTool: 'select',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const shape = svg.querySelector('[data-shape-id="line-1"]')!;

    fireEvent.mouseDown(shape, getMouseEvent(100, 100));
    fireEvent.mouseMove(svg, getMouseEvent(120, 130));
    fireEvent.mouseUp(svg, getMouseEvent(120, 130));

    const state = useDrawingStore.getState();
    const moved = state.shapes.find((s) => s.id === 'line-1') as LineShape;
    expect(moved.x1).toBe(70);
    expect(moved.y1).toBe(80);
    expect(moved.x2).toBe(270);
    expect(moved.y2).toBe(280);
  });

  it('dragging a selected text updates x and y', () => {
    useDrawingStore.setState({
      shapes: [makeText()],
      selectedIds: ['text-1'],
      activeTool: 'select',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const shape = svg.querySelector('[data-shape-id="text-1"]')!;

    fireEvent.mouseDown(shape, getMouseEvent(300, 300));
    fireEvent.mouseMove(svg, getMouseEvent(350, 320));
    fireEvent.mouseUp(svg, getMouseEvent(350, 320));

    const state = useDrawingStore.getState();
    const moved = state.shapes.find((s) => s.id === 'text-1') as TextShape;
    expect(moved.x).toBe(350);
    expect(moved.y).toBe(320);
  });

  it('does not move when tool is not select', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'rect',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const shape = svg.querySelector('[data-shape-id="rect-1"]')!;

    fireEvent.mouseDown(shape, getMouseEvent(150, 150));
    fireEvent.mouseMove(svg, getMouseEvent(200, 200));
    fireEvent.mouseUp(svg, getMouseEvent(200, 200));

    const state = useDrawingStore.getState();
    const rect = state.shapes.find((s) => s.id === 'rect-1') as RectShape;
    expect(rect.x).toBe(100);
    expect(rect.y).toBe(100);
  });
});

describe('Canvas Interactions - US-023: Deselect all', () => {
  it('clicking empty canvas background clears selection', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const background = svg.querySelector('[data-background="true"]')!;

    fireEvent.mouseDown(background, getMouseEvent(500, 500));
    fireEvent.mouseUp(background, getMouseEvent(500, 500));

    const state = useDrawingStore.getState();
    expect(state.selectedIds).toHaveLength(0);
  });

  it('clicking empty canvas does not clear selection when tool is not select', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'rect',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const background = svg.querySelector('[data-background="true"]')!;

    fireEvent.mouseDown(background, getMouseEvent(500, 500));
    fireEvent.mouseUp(background, getMouseEvent(500, 500));

    const state = useDrawingStore.getState();
    expect(state.selectedIds).toContain('rect-1');
  });
});
