/**
 * CreatureViewer Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CreatureViewer from './CreatureViewer';
import { useCreature } from '../../hooks/useCreature';
import { useBitcoinData } from '../../hooks/useBitcoinData';

// Mock the hooks
jest.mock('../../hooks/useCreature');
jest.mock('../../hooks/useBitcoinData');
jest.mock('../ParticleRenderer', () => ({
  __esModule: true,
  default: () => <div data-testid="particle-renderer" />
}));

describe('CreatureViewer', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    (useCreature as jest.Mock).mockReturnValue({
      creature: null,
      isLoading: true,
      error: null
    });
    
    (useBitcoinData as jest.Mock).mockReturnValue({
      blockData: null,
      isLoading: true,
      error: null
    });
  });
  
  it('renders loading state', () => {
    render(<CreatureViewer />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('renders error state', () => {
    (useBitcoinData as jest.Mock).mockReturnValue({
      blockData: null,
      isLoading: false,
      error: 'Failed to fetch block data'
    });
    
    render(<CreatureViewer />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch block data/i)).toBeInTheDocument();
  });
  
  it('renders creature when data is loaded', async () => {
    const mockCreature = {
      id: 'creature-123',
      name: 'Test Creature',
      particles: []
    };
    
    const mockBlockData = {
      height: 123456,
      nonce: '12345',
      confirmations: 1000
    };
    
    (useCreature as jest.Mock).mockReturnValue({
      creature: mockCreature,
      isLoading: false,
      error: null
    });
    
    (useBitcoinData as jest.Mock).mockReturnValue({
      blockData: mockBlockData,
      isLoading: false,
      error: null
    });
    
    render(<CreatureViewer />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Creature')).toBeInTheDocument();
      expect(screen.getByText(/block: 123456/i)).toBeInTheDocument();
      expect(screen.getByTestId('particle-renderer')).toBeInTheDocument();
    });
  });
  
  it('calls onCreatureLoad callback when creature is loaded', async () => {
    const mockCreature = {
      id: 'creature-123',
      name: 'Test Creature',
      particles: []
    };
    
    (useCreature as jest.Mock).mockReturnValue({
      creature: mockCreature,
      isLoading: false,
      error: null
    });
    
    (useBitcoinData as jest.Mock).mockReturnValue({
      blockData: { height: 123456 },
      isLoading: false,
      error: null
    });
    
    const onCreatureLoad = jest.fn();
    
    render(<CreatureViewer onCreatureLoad={onCreatureLoad} />);
    
    await waitFor(() => {
      expect(onCreatureLoad).toHaveBeenCalledWith('creature-123');
    });
  });
});
