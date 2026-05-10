import { render, screen } from '@testing-library/react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { PropertyPanel } from '../PropertyPanel';
import type { RectShape, LineShape } from '@/types';

const makeRect = (overrides?: Partial<RectShape>): RectShape => ({
  id: 'rect-1',
  type: 'rect',
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 0.8 },
  ...overrides,
});

const makeLine = (overrides?: Partial<LineShape>): LineShape => ({
  id: 'line-1',
  type: 'line',
  x1: 0,
  y1: 0,
  x2: 100,
  y2: 100,
  style: { stroke: '#000000', strokeWidth: 1, opacity: 1 },
  ...overrides,
});

describe('PropertyPanel', () => {
  beforeEach(() => {
    useDrawingStore.setState({ shapes: [], selectedIds: [], activeTool: 'select' });
  });

  describe('no selection state', () => {
    it('shows "No Selection" message when nothing selected', () => {
      render(<PropertyPanel />);
      expect(screen.getByText(/no selection/i)).toBeInTheDocument();
    });

    it('renders the panel container', () => {
      render(<PropertyPanel />);
      expect(screen.getByTestId('property-panel')).toBeInTheDocument();
    });
  });

  describe('with shape selected', () => {
    beforeEach(() => {
      useDrawingStore.setState({
        shapes: [makeRect()],
        selectedIds: ['rect-1'],
      });
    });

    it('shows "Properties" heading', () => {
      render(<PropertyPanel />);
      expect(screen.getByText(/properties/i)).toBeInTheDocument();
    });

    it('shows stroke color field', () => {
      render(<PropertyPanel />);
      expect(screen.getByLabelText(/stroke color/i)).toBeInTheDocument();
    });

    it('shows fill color field', () => {
      render(<PropertyPanel />);
      expect(screen.getByLabelText(/fill color/i)).toBeInTheDocument();
    });

    it('shows stroke width field', () => {
      render(<PropertyPanel />);
      expect(screen.getByLabelText(/stroke width/i)).toBeInTheDocument();
    });

    it('shows opacity field', () => {
      render(<PropertyPanel />);
      expect(screen.getByLabelText(/opacity/i)).toBeInTheDocument();
    });

    it('displays current stroke color value', () => {
      render(<PropertyPanel />);
      const input = screen.getByLabelText(/stroke color/i);
      expect(input).toHaveValue('#000000');
    });

    it('displays current fill color value', () => {
      render(<PropertyPanel />);
      const input = screen.getByLabelText(/fill color/i);
      expect(input).toHaveValue('#ff0000');
    });

    it('displays current stroke width value', () => {
      render(<PropertyPanel />);
      const input = screen.getByLabelText(/stroke width/i);
      expect(input).toHaveValue(2);
    });

    it('displays current opacity value', () => {
      render(<PropertyPanel />);
      const input = screen.getByLabelText(/opacity/i);
      expect(input).toHaveValue(0.8);
    });
  });

  describe('shape type display', () => {
    it('shows shape type label for rect', () => {
      useDrawingStore.setState({ shapes: [makeRect()], selectedIds: ['rect-1'] });
      render(<PropertyPanel />);
      expect(screen.getByText(/rect/i)).toBeInTheDocument();
    });

    it('shows shape type label for line', () => {
      useDrawingStore.setState({ shapes: [makeLine()], selectedIds: ['line-1'] });
      render(<PropertyPanel />);
      expect(screen.getByText(/line/i)).toBeInTheDocument();
    });
  });

  describe('missing selection edge case', () => {
    it('shows no-selection when selectedId does not match any shape', () => {
      useDrawingStore.setState({ shapes: [], selectedIds: ['nonexistent'] });
      render(<PropertyPanel />);
      expect(screen.getByText(/no selection/i)).toBeInTheDocument();
    });
  });
});
