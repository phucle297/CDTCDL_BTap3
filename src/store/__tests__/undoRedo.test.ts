import { useDrawingStore } from '../useDrawingStore';
import type { RectShape } from '@/types';

const makeRect = (id: string, x = 10): RectShape => ({
  id,
  type: 'rect',
  x,
  y: 20,
  width: 100,
  height: 50,
  style: { fill: 'none', stroke: '#000000', strokeWidth: 1, opacity: 1 },
});

describe('Undo/Redo', () => {
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

  it('addShape pushes previous state to historyStack', () => {
    const { addShape } = useDrawingStore.getState();
    addShape(makeRect('r1'));
    const state = useDrawingStore.getState();
    expect(state.shapes).toHaveLength(1);
    expect(state.historyStack).toHaveLength(1);
    expect(state.historyStack[0]).toEqual([]);
  });

  it('undo restores previous shapes and pushes current to futureStack', () => {
    const { addShape } = useDrawingStore.getState();
    addShape(makeRect('r1'));
    addShape(makeRect('r2'));

    useDrawingStore.getState().undo();
    const state = useDrawingStore.getState();
    expect(state.shapes).toHaveLength(1);
    expect(state.shapes[0].id).toBe('r1');
    expect(state.futureStack).toHaveLength(1);
  });

  it('redo restores future shapes and pushes current to historyStack', () => {
    const { addShape } = useDrawingStore.getState();
    addShape(makeRect('r1'));
    addShape(makeRect('r2'));

    useDrawingStore.getState().undo();
    useDrawingStore.getState().redo();
    const state = useDrawingStore.getState();
    expect(state.shapes).toHaveLength(2);
    expect(state.futureStack).toHaveLength(0);
  });

  it('new action after undo clears futureStack', () => {
    const { addShape } = useDrawingStore.getState();
    addShape(makeRect('r1'));
    addShape(makeRect('r2'));

    useDrawingStore.getState().undo();
    useDrawingStore.getState().addShape(makeRect('r3'));
    const state = useDrawingStore.getState();
    expect(state.futureStack).toHaveLength(0);
    expect(state.shapes).toHaveLength(2);
    expect(state.shapes[1].id).toBe('r3');
  });

  it('history capped at 50 entries', () => {
    for (let i = 0; i < 55; i++) {
      useDrawingStore.getState().addShape(makeRect(`r${i}`));
    }
    const state = useDrawingStore.getState();
    expect(state.historyStack.length).toBeLessThanOrEqual(50);
  });

  it('undo does nothing when historyStack is empty', () => {
    useDrawingStore.getState().undo();
    const state = useDrawingStore.getState();
    expect(state.shapes).toEqual([]);
    expect(state.futureStack).toEqual([]);
  });

  it('redo does nothing when futureStack is empty', () => {
    useDrawingStore.getState().redo();
    const state = useDrawingStore.getState();
    expect(state.shapes).toEqual([]);
    expect(state.historyStack).toEqual([]);
  });

  it('updateShape does not push history (requires explicit commitHistory)', () => {
    const { addShape } = useDrawingStore.getState();
    addShape(makeRect('r1'));
    useDrawingStore.getState().updateShape('r1', { x: 999 });
    const state = useDrawingStore.getState();
    expect(state.historyStack).toHaveLength(1);
    expect((state.shapes[0] as RectShape).x).toBe(999);
  });

  it('commitHistory snapshots current shapes', () => {
    const { addShape } = useDrawingStore.getState();
    addShape(makeRect('r1'));
    useDrawingStore.getState().commitHistory();
    const state = useDrawingStore.getState();
    expect(state.historyStack).toHaveLength(2);
  });

  it('deleteShape pushes to historyStack', () => {
    const { addShape } = useDrawingStore.getState();
    addShape(makeRect('r1'));
    useDrawingStore.getState().deleteShape('r1');
    const state = useDrawingStore.getState();
    expect(state.historyStack).toHaveLength(2);
    expect(state.shapes).toHaveLength(0);
  });

  it('loadShapes resets history stacks', () => {
    const { addShape } = useDrawingStore.getState();
    addShape(makeRect('r1'));
    useDrawingStore.getState().loadShapes([makeRect('new1'), makeRect('new2')]);
    const state = useDrawingStore.getState();
    expect(state.historyStack).toHaveLength(0);
    expect(state.futureStack).toHaveLength(0);
    expect(state.shapes).toHaveLength(2);
  });
});
