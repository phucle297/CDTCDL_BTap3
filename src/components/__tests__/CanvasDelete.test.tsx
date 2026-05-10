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

describe('Canvas - US-022: Delete shape', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [makeRect(), makeEllipse()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
  });

  it('pressing Delete key removes the selected shape', () => {
    render(<Canvas />);

    fireEvent.keyDown(document, { key: 'Delete' });

    const state = useDrawingStore.getState();
    expect(state.shapes.find((s) => s.id === 'rect-1')).toBeUndefined();
    expect(state.shapes).toHaveLength(1);
    expect(state.selectedIds).toHaveLength(0);
  });

  it('pressing Backspace key removes the selected shape', () => {
    render(<Canvas />);

    fireEvent.keyDown(document, { key: 'Backspace' });

    const state = useDrawingStore.getState();
    expect(state.shapes.find((s) => s.id === 'rect-1')).toBeUndefined();
    expect(state.selectedIds).toHaveLength(0);
  });

  it('does not delete when no shape is selected', () => {
    useDrawingStore.setState({
      shapes: [makeRect(), makeEllipse()],
      selectedIds: [],
      activeTool: 'select',
    });
    render(<Canvas />);

    fireEvent.keyDown(document, { key: 'Delete' });

    const state = useDrawingStore.getState();
    expect(state.shapes).toHaveLength(2);
  });

  it('clears selectedIds after deletion', () => {
    render(<Canvas />);

    fireEvent.keyDown(document, { key: 'Delete' });

    const state = useDrawingStore.getState();
    expect(state.selectedIds).toHaveLength(0);
  });
});

describe('Shape Selection Indicators', () => {
  it('selected rect shows selection indicator', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const indicator = svg.querySelector('[data-selection-indicator="rect-1"]');
    expect(indicator).not.toBeNull();
  });

  it('unselected shape does not show selection indicator', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: [],
      activeTool: 'select',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const indicator = svg.querySelector('[data-selection-indicator="rect-1"]');
    expect(indicator).toBeNull();
  });

  it('selection indicator has dashed blue stroke', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const indicator = svg.querySelector('[data-selection-indicator="rect-1"]');
    expect(indicator).not.toBeNull();
    expect(indicator!.getAttribute('stroke')).toBe('blue');
    expect(indicator!.getAttribute('stroke-dasharray')).toBeTruthy();
  });
});
