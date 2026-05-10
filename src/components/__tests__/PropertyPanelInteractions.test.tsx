import { render, screen, fireEvent } from '@testing-library/react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { PropertyPanel } from '../PropertyPanel';
import type { RectShape, TextShape } from '@/types';

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

const makeText = (overrides?: Partial<TextShape>): TextShape => ({
  id: 'text-1',
  type: 'text',
  x: 50,
  y: 50,
  content: 'Hello World',
  fontSize: 16,
  style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
  ...overrides,
});

describe('PropertyPanel - US-030–033: Property editing', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
  });

  it('displays fill color input with current shape fill', () => {
    render(<PropertyPanel />);
    const fillInput = screen.getByLabelText(/fill/i) as HTMLInputElement;
    expect(fillInput.value).toBe('#ff0000');
  });

  it('displays stroke color input with current shape stroke', () => {
    render(<PropertyPanel />);
    const strokeInput = screen.getByLabelText(/stroke color/i) as HTMLInputElement;
    expect(strokeInput.value).toBe('#000000');
  });

  it('displays stroke width input with current value', () => {
    render(<PropertyPanel />);
    const widthInput = screen.getByLabelText(/stroke width/i) as HTMLInputElement;
    expect(widthInput.value).toBe('2');
  });

  it('displays opacity input with current value', () => {
    render(<PropertyPanel />);
    const opacityInput = screen.getByLabelText(/opacity/i) as HTMLInputElement;
    expect(opacityInput.value).toBe('1');
  });

  it('changing fill color calls updateShape', () => {
    render(<PropertyPanel />);
    const fillInput = screen.getByLabelText(/fill/i);
    fireEvent.change(fillInput, { target: { value: '#00ff00' } });

    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'rect-1') as RectShape;
    expect(shape.style.fill).toBe('#00ff00');
  });

  it('changing stroke color calls updateShape', () => {
    render(<PropertyPanel />);
    const strokeInput = screen.getByLabelText(/stroke color/i);
    fireEvent.change(strokeInput, { target: { value: '#ff00ff' } });

    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'rect-1') as RectShape;
    expect(shape.style.stroke).toBe('#ff00ff');
  });

  it('changing stroke width calls updateShape', () => {
    render(<PropertyPanel />);
    const widthInput = screen.getByLabelText(/stroke width/i);
    fireEvent.change(widthInput, { target: { value: '5' } });

    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'rect-1') as RectShape;
    expect(shape.style.strokeWidth).toBe(5);
  });

  it('changing opacity calls updateShape', () => {
    render(<PropertyPanel />);
    const opacityInput = screen.getByLabelText(/opacity/i);
    fireEvent.change(opacityInput, { target: { value: '0.5' } });

    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'rect-1') as RectShape;
    expect(shape.style.opacity).toBe(0.5);
  });

  it('inputs are disabled when no shape is selected', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: [],
      activeTool: 'select',
    });
    render(<PropertyPanel />);
    const fillInput = screen.queryByLabelText(/fill/i);
    if (fillInput) {
      expect(fillInput).toBeDisabled();
    }
  });
});

describe('PropertyPanel - US-034: Default properties', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [],
      selectedIds: [],
      activeTool: 'select',
      defaultProperties: { fill: '#ffffff', stroke: '#000000', strokeWidth: 1, opacity: 1 },
    });
  });

  it('shows default property values when no shape selected', () => {
    render(<PropertyPanel />);
    const fillInput = screen.getByLabelText(/fill/i) as HTMLInputElement;
    expect(fillInput.value).toBe('#ffffff');
  });

  it('changing default fill updates store defaultProperties', () => {
    render(<PropertyPanel />);
    const fillInput = screen.getByLabelText(/fill/i);
    fireEvent.change(fillInput, { target: { value: '#0000ff' } });

    const state = useDrawingStore.getState();
    expect((state as { defaultProperties: { fill: string } }).defaultProperties.fill).toBe(
      '#0000ff'
    );
  });
});

describe('PropertyPanel - US-052: Font size', () => {
  it('shows fontSize input when TextShape is selected', () => {
    useDrawingStore.setState({
      shapes: [makeText()],
      selectedIds: ['text-1'],
      activeTool: 'select',
    });
    render(<PropertyPanel />);
    const fontSizeInput = screen.getByLabelText(/font size/i) as HTMLInputElement;
    expect(fontSizeInput).toBeInTheDocument();
    expect(fontSizeInput.value).toBe('16');
  });

  it('does not show fontSize input when non-text shape is selected', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
    render(<PropertyPanel />);
    const fontSizeInput = screen.queryByLabelText(/font size/i);
    expect(fontSizeInput).toBeNull();
  });

  it('changing fontSize calls updateShape', () => {
    useDrawingStore.setState({
      shapes: [makeText()],
      selectedIds: ['text-1'],
      activeTool: 'select',
    });
    render(<PropertyPanel />);
    const fontSizeInput = screen.getByLabelText(/font size/i);
    fireEvent.change(fontSizeInput, { target: { value: '24' } });

    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'text-1') as TextShape;
    expect(shape.fontSize).toBe(24);
  });

  it('fontSize has min 8 and max 200', () => {
    useDrawingStore.setState({
      shapes: [makeText()],
      selectedIds: ['text-1'],
      activeTool: 'select',
    });
    render(<PropertyPanel />);
    const fontSizeInput = screen.getByLabelText(/font size/i) as HTMLInputElement;
    expect(fontSizeInput.getAttribute('min')).toBe('8');
    expect(fontSizeInput.getAttribute('max')).toBe('200');
  });
});

describe('PropertyPanel - US-022: Delete button', () => {
  it('shows delete button when shape is selected', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
    render(<PropertyPanel />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    expect(deleteBtn).toBeInTheDocument();
  });

  it('clicking delete button removes the selected shape', () => {
    useDrawingStore.setState({
      shapes: [makeRect()],
      selectedIds: ['rect-1'],
      activeTool: 'select',
    });
    render(<PropertyPanel />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    const state = useDrawingStore.getState();
    expect(state.shapes.find((s) => s.id === 'rect-1')).toBeUndefined();
    expect(state.selectedIds).toHaveLength(0);
  });
});
