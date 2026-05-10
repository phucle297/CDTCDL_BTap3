import { useDrawingStore } from '../useDrawingStore';
import type { RectShape, CircleShape, ToolType } from '@/types';

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
  style: { fill: 'none', stroke: '#000000', strokeWidth: 1, opacity: 1 },
  ...overrides,
});

describe('useDrawingStore', () => {
  beforeEach(() => {
    useDrawingStore.setState({
      shapes: [],
      selectedIds: [],
      activeTool: 'select',
    });
  });

  describe('initial state', () => {
    it('starts with empty shapes array', () => {
      expect(useDrawingStore.getState().shapes).toEqual([]);
    });

    it('starts with empty selectedIds', () => {
      expect(useDrawingStore.getState().selectedIds).toEqual([]);
    });

    it('starts with select as active tool', () => {
      expect(useDrawingStore.getState().activeTool).toBe('select');
    });
  });

  describe('setActiveTool', () => {
    it('changes active tool to rect', () => {
      useDrawingStore.getState().setActiveTool('rect');
      expect(useDrawingStore.getState().activeTool).toBe('rect');
    });

    it('changes active tool to circle', () => {
      useDrawingStore.getState().setActiveTool('circle');
      expect(useDrawingStore.getState().activeTool).toBe('circle');
    });

    it('accepts all drawing tool types', () => {
      const tools: ToolType[] = ['select', 'rect', 'circle', 'ellipse', 'line', 'text'];
      for (const tool of tools) {
        useDrawingStore.getState().setActiveTool(tool);
        expect(useDrawingStore.getState().activeTool).toBe(tool);
      }
    });
  });

  describe('addShape', () => {
    it('adds a shape to the array', () => {
      const rect = makeRect();
      useDrawingStore.getState().addShape(rect);
      expect(useDrawingStore.getState().shapes).toHaveLength(1);
      expect(useDrawingStore.getState().shapes[0]).toEqual(rect);
    });

    it('appends new shapes to end (z-order)', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().addShape(makeCircle());
      const shapes = useDrawingStore.getState().shapes;
      expect(shapes).toHaveLength(2);
      expect(shapes[0].type).toBe('rect');
      expect(shapes[1].type).toBe('circle');
    });

    it('preserves existing shapes when adding', () => {
      const rect = makeRect();
      const circle = makeCircle();
      useDrawingStore.getState().addShape(rect);
      useDrawingStore.getState().addShape(circle);
      expect(useDrawingStore.getState().shapes[0]).toEqual(rect);
    });
  });

  describe('updateShape', () => {
    it('updates shape properties by id', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().updateShape('rect-1', { x: 50, y: 60 });
      const updated = useDrawingStore.getState().shapes[0] as RectShape;
      expect(updated.x).toBe(50);
      expect(updated.y).toBe(60);
    });

    it('preserves unchanged properties', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().updateShape('rect-1', { x: 50 });
      const updated = useDrawingStore.getState().shapes[0] as RectShape;
      expect(updated.y).toBe(20);
      expect(updated.width).toBe(100);
      expect(updated.height).toBe(50);
    });

    it('does not modify other shapes', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().addShape(makeCircle());
      useDrawingStore.getState().updateShape('rect-1', { x: 999 });
      const circle = useDrawingStore.getState().shapes[1] as CircleShape;
      expect(circle.cx).toBe(50);
    });

    it('handles updating style properties', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().updateShape('rect-1', {
        style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 0.5 },
      });
      const updated = useDrawingStore.getState().shapes[0];
      expect(updated.style.fill).toBe('#ff0000');
      expect(updated.style.strokeWidth).toBe(2);
    });

    it('does nothing for non-existent id', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().updateShape('nonexistent', { x: 999 });
      const rect = useDrawingStore.getState().shapes[0] as RectShape;
      expect(rect.x).toBe(10);
    });
  });

  describe('deleteShape', () => {
    it('removes shape by id', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().deleteShape('rect-1');
      expect(useDrawingStore.getState().shapes).toHaveLength(0);
    });

    it('removes only the target shape', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().addShape(makeCircle());
      useDrawingStore.getState().deleteShape('rect-1');
      expect(useDrawingStore.getState().shapes).toHaveLength(1);
      expect(useDrawingStore.getState().shapes[0].id).toBe('circle-1');
    });

    it('clears selectedIds when deleted shape was selected', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().setSelectedIds(['rect-1']);
      useDrawingStore.getState().deleteShape('rect-1');
      expect(useDrawingStore.getState().selectedIds).toEqual([]);
    });

    it('clears all selection on delete', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().addShape(makeCircle());
      useDrawingStore.getState().setSelectedIds(['circle-1']);
      useDrawingStore.getState().deleteShape('rect-1');
      expect(useDrawingStore.getState().selectedIds).toEqual([]);
    });

    it('does nothing for non-existent id', () => {
      useDrawingStore.getState().addShape(makeRect());
      useDrawingStore.getState().deleteShape('nonexistent');
      expect(useDrawingStore.getState().shapes).toHaveLength(1);
    });
  });

  describe('setSelectedIds', () => {
    it('sets selected shape ids', () => {
      useDrawingStore.getState().setSelectedIds(['rect-1']);
      expect(useDrawingStore.getState().selectedIds).toEqual(['rect-1']);
    });

    it('replaces previous selection', () => {
      useDrawingStore.getState().setSelectedIds(['rect-1']);
      useDrawingStore.getState().setSelectedIds(['circle-1']);
      expect(useDrawingStore.getState().selectedIds).toEqual(['circle-1']);
    });
  });

  describe('clearSelection', () => {
    it('empties selectedIds', () => {
      useDrawingStore.getState().setSelectedIds(['rect-1', 'circle-1']);
      useDrawingStore.getState().clearSelection();
      expect(useDrawingStore.getState().selectedIds).toEqual([]);
    });

    it('is safe to call when already empty', () => {
      useDrawingStore.getState().clearSelection();
      expect(useDrawingStore.getState().selectedIds).toEqual([]);
    });
  });
});
