import { create } from 'zustand';
import type { Shape, ShapeStyle, ToolType } from '@/types';

const MAX_HISTORY = 50;

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DrawingState {
  shapes: Shape[];
  selectedIds: string[];
  activeTool: ToolType;
  defaultProperties: ShapeStyle;
  historyStack: Shape[][];
  futureStack: Shape[][];
  viewBox: ViewBox;
  setActiveTool: (tool: ToolType) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  setDefaultProperties: (props: Partial<ShapeStyle>) => void;
  loadShapes: (shapes: Shape[]) => void;
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  setViewBox: (viewBox: ViewBox) => void;
}

function pushHistory(historyStack: Shape[][], currentShapes: Shape[]): Shape[][] {
  const next = [...historyStack, [...currentShapes]];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

export const useDrawingStore = create<DrawingState>()((set) => ({
  shapes: [],
  selectedIds: [],
  activeTool: 'select',
  defaultProperties: { fill: '#ffffff', stroke: '#000000', strokeWidth: 1, opacity: 1 },
  historyStack: [],
  futureStack: [],
  viewBox: { x: 0, y: 0, width: 800, height: 600 },
  setActiveTool: (tool) => set({ activeTool: tool }),
  addShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, shape],
      historyStack: pushHistory(state.historyStack, state.shapes),
      futureStack: [],
    })),
  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((s) => (s.id === id ? ({ ...s, ...updates } as Shape) : s)),
    })),
  deleteShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((s) => s.id !== id),
      selectedIds: [],
      historyStack: pushHistory(state.historyStack, state.shapes),
      futureStack: [],
    })),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  setDefaultProperties: (props) =>
    set((state) => ({ defaultProperties: { ...state.defaultProperties, ...props } })),
  loadShapes: (shapes) =>
    set(() => ({
      shapes,
      selectedIds: [],
      historyStack: [],
      futureStack: [],
    })),
  commitHistory: () =>
    set((state) => ({
      historyStack: pushHistory(state.historyStack, state.shapes),
      futureStack: [],
    })),
  undo: () =>
    set((state) => {
      if (state.historyStack.length === 0) return state;
      const historyStack = [...state.historyStack];
      const previous = historyStack.pop()!;
      return {
        shapes: previous,
        historyStack,
        futureStack: [...state.futureStack, [...state.shapes]],
      };
    }),
  redo: () =>
    set((state) => {
      if (state.futureStack.length === 0) return state;
      const futureStack = [...state.futureStack];
      const next = futureStack.pop()!;
      return {
        shapes: next,
        futureStack,
        historyStack: [...state.historyStack, [...state.shapes]],
      };
    }),
  setViewBox: (viewBox) => set({ viewBox }),
}));
