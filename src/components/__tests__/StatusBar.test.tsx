import { render, screen } from '@testing-library/react';
import { StatusBar } from '../StatusBar';

describe('StatusBar', () => {
  it('renders X and Y values correctly', () => {
    render(<StatusBar x={150} y={230} />);
    expect(screen.getByText('X: 150')).toBeInTheDocument();
    expect(screen.getByText('Y: 230')).toBeInTheDocument();
  });

  it('renders — when values are null', () => {
    render(<StatusBar x={null} y={null} />);
    expect(screen.getByText('X: —')).toBeInTheDocument();
    expect(screen.getByText('Y: —')).toBeInTheDocument();
  });

  it('renders — for individual null values', () => {
    render(<StatusBar x={42} y={null} />);
    expect(screen.getByText('X: 42')).toBeInTheDocument();
    expect(screen.getByText('Y: —')).toBeInTheDocument();
  });

  it('rounds coordinates to nearest integer', () => {
    render(<StatusBar x={99.7} y={10.2} />);
    expect(screen.getByText('X: 100')).toBeInTheDocument();
    expect(screen.getByText('Y: 10')).toBeInTheDocument();
  });
});
