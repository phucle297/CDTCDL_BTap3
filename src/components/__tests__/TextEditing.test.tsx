import { render, screen, fireEvent } from '@testing-library/react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { Canvas } from '../Canvas';
import type { TextShape } from '@/types';

const makeText = (overrides?: Partial<TextShape>): TextShape => ({
  id: 'text-1',
  type: 'text',
  x: 100,
  y: 100,
  content: 'Original Text',
  fontSize: 16,
  style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
  ...overrides,
});

describe('Canvas - US-051: Edit text content', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [makeText()],
      selectedIds: ['text-1'],
      activeTool: 'select',
    });
  });

  it('double-clicking a text shape enters edit mode with textarea', () => {
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const textEl = svg.querySelector('[data-shape-id="text-1"]')!;

    fireEvent.doubleClick(textEl);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect((textarea as HTMLTextAreaElement).value).toBe('Original Text');
  });

  it('typing in textarea updates content live via updateShape', () => {
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const textEl = svg.querySelector('[data-shape-id="text-1"]')!;

    fireEvent.doubleClick(textEl);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated Text' } });

    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'text-1') as TextShape;
    expect(shape.content).toBe('Updated Text');
  });

  it('pressing Enter commits and exits edit mode', () => {
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const textEl = svg.querySelector('[data-shape-id="text-1"]')!;

    fireEvent.doubleClick(textEl);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Committed' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(screen.queryByRole('textbox')).toBeNull();
    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'text-1') as TextShape;
    expect(shape.content).toBe('Committed');
  });

  it('pressing Escape reverts to original content and exits edit mode', () => {
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const textEl = svg.querySelector('[data-shape-id="text-1"]')!;

    fireEvent.doubleClick(textEl);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Should be reverted' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });

    expect(screen.queryByRole('textbox')).toBeNull();
    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'text-1') as TextShape;
    expect(shape.content).toBe('Original Text');
  });

  it('clicking outside the textarea commits and exits edit mode', () => {
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const textEl = svg.querySelector('[data-shape-id="text-1"]')!;

    fireEvent.doubleClick(textEl);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Click outside commit' } });
    fireEvent.blur(textarea);

    expect(screen.queryByRole('textbox')).toBeNull();
    const state = useDrawingStore.getState();
    const shape = state.shapes.find((s) => s.id === 'text-1') as TextShape;
    expect(shape.content).toBe('Click outside commit');
  });

  it('does not enter edit mode when tool is not select', () => {
    useDrawingStore.setState({
      shapes: [makeText()],
      selectedIds: ['text-1'],
      activeTool: 'rect',
    });
    render(<Canvas />);
    const svg = screen.getByTestId('svg-canvas');
    const textEl = svg.querySelector('[data-shape-id="text-1"]')!;

    fireEvent.doubleClick(textEl);

    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
