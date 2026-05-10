import { useEffect } from 'react';
import { useDrawingStore } from '@/store/useDrawingStore';
import { exportSVG } from '@/utils/exportSVG';

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (target.isContentEditable) return;

      // Tool shortcuts (no modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'v': useDrawingStore.getState().setActiveTool('select'); return;
          case 'r': useDrawingStore.getState().setActiveTool('rect'); return;
          case 'e': useDrawingStore.getState().setActiveTool('ellipse'); return;
          case 'l': useDrawingStore.getState().setActiveTool('line'); return;
          case 't': useDrawingStore.getState().setActiveTool('text'); return;
          case 'Escape': useDrawingStore.getState().clearSelection(); return;
          case 'Delete':
          case 'Backspace': {
            const state = useDrawingStore.getState();
            if (state.selectedIds.length > 0) {
              state.deleteShape(state.selectedIds[0]);
              state.clearSelection();
            }
            return;
          }
        }
      }

      // Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              useDrawingStore.getState().redo();
            } else {
              useDrawingStore.getState().undo();
            }
            return;
          case 'y':
            e.preventDefault();
            useDrawingStore.getState().redo();
            return;
          case 's': {
            e.preventDefault();
            const shapes = useDrawingStore.getState().shapes;
            const svgString = exportSVG(shapes, 800, 600);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'drawing.svg';
            a.click();
            URL.revokeObjectURL(url);
            return;
          }
          case '=':
          case '+': {
            e.preventDefault();
            const vb = useDrawingStore.getState().viewBox;
            const factor = 0.9;
            const cx = vb.x + vb.width / 2;
            const cy = vb.y + vb.height / 2;
            const nw = vb.width * factor;
            const nh = vb.height * factor;
            useDrawingStore.getState().setViewBox({ x: cx - nw / 2, y: cy - nh / 2, width: nw, height: nh });
            return;
          }
          case '-': {
            e.preventDefault();
            const vb = useDrawingStore.getState().viewBox;
            const factor = 1.1;
            const cx = vb.x + vb.width / 2;
            const cy = vb.y + vb.height / 2;
            const nw = vb.width * factor;
            const nh = vb.height * factor;
            useDrawingStore.getState().setViewBox({ x: cx - nw / 2, y: cy - nh / 2, width: nw, height: nh });
            return;
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
