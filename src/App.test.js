import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the travel map entry point', () => {
  render(<App />);
  expect(screen.getByText(/my travel map/i)).toBeInTheDocument();
});
