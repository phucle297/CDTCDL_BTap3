import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDrawingStore } from '@/store/useDrawingStore';
import { Toolbar } from '../Toolbar';

describe('Toolbar', () => {
  beforeEach(() => {
    useDrawingStore.setState({ shapes: [], selectedIds: [], activeTool: 'select' });
  });

  describe('tool buttons rendering', () => {
    it('renders a Select tool button', () => {
      render(<Toolbar />);
      expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument();
    });

    it('renders a Rectangle tool button', () => {
      render(<Toolbar />);
      expect(screen.getByRole('button', { name: /rectangle/i })).toBeInTheDocument();
    });

    it('renders an Ellipse tool button', () => {
      render(<Toolbar />);
      expect(screen.getByRole('button', { name: /ellipse/i })).toBeInTheDocument();
    });

    it('renders a Line tool button', () => {
      render(<Toolbar />);
      expect(screen.getByRole('button', { name: /line/i })).toBeInTheDocument();
    });

    it('renders a Text tool button', () => {
      render(<Toolbar />);
      expect(screen.getByRole('button', { name: /text/i })).toBeInTheDocument();
    });
  });

  describe('active tool indication', () => {
    it('Select tool is active by default', () => {
      render(<Toolbar />);
      const selectBtn = screen.getByRole('button', { name: /select/i });
      expect(selectBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('non-active tools are not pressed', () => {
      render(<Toolbar />);
      const rectBtn = screen.getByRole('button', { name: /rectangle/i });
      expect(rectBtn).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('tool selection interaction', () => {
    it('clicking Rectangle tool sets it as active in store', async () => {
      const user = userEvent.setup();
      render(<Toolbar />);
      await user.click(screen.getByRole('button', { name: /rectangle/i }));
      expect(useDrawingStore.getState().activeTool).toBe('rect');
    });

    it('clicking Ellipse tool sets it as active in store', async () => {
      const user = userEvent.setup();
      render(<Toolbar />);
      await user.click(screen.getByRole('button', { name: /ellipse/i }));
      expect(useDrawingStore.getState().activeTool).toBe('ellipse');
    });

    it('clicking Line tool sets it as active in store', async () => {
      const user = userEvent.setup();
      render(<Toolbar />);
      await user.click(screen.getByRole('button', { name: /line/i }));
      expect(useDrawingStore.getState().activeTool).toBe('line');
    });

    it('clicking Text tool sets it as active in store', async () => {
      const user = userEvent.setup();
      render(<Toolbar />);
      await user.click(screen.getByRole('button', { name: /text/i }));
      expect(useDrawingStore.getState().activeTool).toBe('text');
    });

    it('clicking active tool then another switches active', async () => {
      const user = userEvent.setup();
      render(<Toolbar />);
      await user.click(screen.getByRole('button', { name: /rectangle/i }));
      await user.click(screen.getByRole('button', { name: /line/i }));
      expect(useDrawingStore.getState().activeTool).toBe('line');
    });

    it('only one tool has aria-pressed true at a time', async () => {
      const user = userEvent.setup();
      render(<Toolbar />);
      await user.click(screen.getByRole('button', { name: /rectangle/i }));
      const buttons = screen.getAllByRole('button');
      const pressedButtons = buttons.filter((btn) => btn.getAttribute('aria-pressed') === 'true');
      expect(pressedButtons).toHaveLength(1);
    });
  });

  describe('toolbar container', () => {
    it('renders a toolbar landmark', () => {
      render(<Toolbar />);
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });
  });
});
