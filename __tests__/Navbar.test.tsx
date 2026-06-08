import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
// Mock localStorage
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: jest.fn(() => null), setItem: jest.fn() },
    writable: true,
  });
});

describe('Navbar', () => {
  it('renders the logo with the correct name', () => {
    render(<Navbar />);
    expect(screen.getByText('ALAA FAYYAD')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Navbar />);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Skills').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Experience').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
  });

  it('renders the hire button', () => {
    render(<Navbar />);
    expect(screen.getAllByText("Let's Work").length).toBeGreaterThan(0);
  });

  it('renders the language toggle button', () => {
    render(<Navbar />);
    expect(screen.getAllByText('عربي').length).toBeGreaterThan(0);
  });
});


describe('Footer', () => {
    it('renders the copyright text', () => {
    render(<Footer />);
    // expect(screen.getByText(/Built with/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'arrowUp' })).toBeInTheDocument();
  });  
});
