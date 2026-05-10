import { render } from '@testing-library/react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

function TestComponent() {
  useKeyboardShortcuts();
  return <div data-testid="test-component" />;
}

function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    ...opts,
  });
  document.dispatchEvent(event);
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [],
      selectedIds: [],
      activeTool: 'select',
      defaultProperties: { fill: '#ffffff', stroke: '#000000', strokeWidth: 1, opacity: 1 },
      historyStack: [],
      futureStack: [],
      viewBox: { x: 0, y: 0, width: 800, height: 600 },
    });
  });

  it('V key switches to select tool', () => {
    useDrawingStore.setState({ activeTool: 'rect' });
    render(<TestComponent />);
    fireKey('v');
    expect(useDrawingStore.getState().activeTool).toBe('select');
  });

  it('R key switches to rectangle tool', () => {
    render(<TestComponent />);
    fireKey('r');
    expect(useDrawingStore.getState().activeTool).toBe('rect');
  });

  it('E key switches to ellipse tool', () => {
    render(<TestComponent />);
    fireKey('e');
    expect(useDrawingStore.getState().activeTool).toBe('ellipse');
  });

  it('L key switches to line tool', () => {
    render(<TestComponent />);
    fireKey('l');
    expect(useDrawingStore.getState().activeTool).toBe('line');
  });

  it('T key switches to text tool', () => {
    render(<TestComponent />);
    fireKey('t');
    expect(useDrawingStore.getState().activeTool).toBe('text');
  });

  it('Ctrl+Z calls undo', () => {
    useDrawingStore.getState().addShape({
      id: 'r1',
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
    });
    render(<TestComponent />);
    fireKey('z', { ctrlKey: true });
    expect(useDrawingStore.getState().shapes).toHaveLength(0);
  });

  it('Ctrl+Shift+Z calls redo', () => {
    useDrawingStore.getState().addShape({
      id: 'r1',
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
    });
    useDrawingStore.getState().undo();
    render(<TestComponent />);
    fireKey('z', { ctrlKey: true, shiftKey: true });
    expect(useDrawingStore.getState().shapes).toHaveLength(1);
  });

  it('Ctrl+Y calls redo', () => {
    useDrawingStore.getState().addShape({
      id: 'r1',
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
    });
    useDrawingStore.getState().undo();
    render(<TestComponent />);
    fireKey('y', { ctrlKey: true });
    expect(useDrawingStore.getState().shapes).toHaveLength(1);
  });

  it('Escape clears selection', () => {
    useDrawingStore.setState({ selectedIds: ['r1'] });
    render(<TestComponent />);
    fireKey('Escape');
    expect(useDrawingStore.getState().selectedIds).toEqual([]);
  });

  it('Delete deletes selected shape', () => {
    useDrawingStore.setState({
      shapes: [
        {
          id: 'r1',
          type: 'rect',
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        },
      ],
      selectedIds: ['r1'],
    });
    render(<TestComponent />);
    fireKey('Delete');
    expect(useDrawingStore.getState().shapes).toHaveLength(0);
  });

  it('shortcuts ignored when input is focused', () => {
    render(<TestComponent />);
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'r',
      bubbles: true,
    });
    Object.defineProperty(event, 'target', { value: input });
    document.dispatchEvent(event);

    expect(useDrawingStore.getState().activeTool).toBe('select');
    document.body.removeChild(input);
  });

  it('shortcuts ignored when textarea is focused', () => {
    render(<TestComponent />);
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'v',
      bubbles: true,
    });
    Object.defineProperty(event, 'target', { value: textarea });
    document.dispatchEvent(event);

    expect(useDrawingStore.getState().activeTool).toBe('select');
    document.body.removeChild(textarea);
  });
});
