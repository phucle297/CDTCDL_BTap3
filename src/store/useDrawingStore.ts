import { create } from 'zustand';
import type { Shape, ToolType } from '@/types';

interface DrawingState {
  shapes: Shape[];
  selectedIds: string[];
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useDrawingStore = create<DrawingState>()((set) => ({
  shapes: [],
  selectedIds: [],
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...updates } as Shape : s)),
    })),
  deleteShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((s) => s.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    })),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
}));

