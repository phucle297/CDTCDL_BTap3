import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home page', () => {
  it('renders the heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /svg graphic editor/i })).toBeInTheDocument();
  });

  it('renders the placeholder text', () => {
    render(<Home />);
    expect(screen.getByText(/editor coming soon/i)).toBeInTheDocument();
  });
});
