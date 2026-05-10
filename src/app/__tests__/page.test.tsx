import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home page — Editor layout', () => {
  it('renders the Toolbar component', () => {
    render(<Home />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders the Canvas component', () => {
    render(<Home />);
    expect(screen.getByTestId('svg-canvas')).toBeInTheDocument();
  });

  it('renders the PropertyPanel component', () => {
    render(<Home />);
    expect(screen.getByTestId('property-panel')).toBeInTheDocument();
  });

  it('renders the application title', () => {
    render(<Home />);
    expect(screen.getByText(/svg graphic editor/i)).toBeInTheDocument();
  });
});
