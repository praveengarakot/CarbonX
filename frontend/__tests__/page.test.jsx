import { expect, test, describe, vi } from 'vitest';
import React from 'react';

// Mock browser-only wallet integrations
vi.mock('@stellar/freighter-api', () => ({
  default: {
    isConnected: () => Promise.resolve({ isConnected: false }),
    getAddress: () => Promise.resolve({ address: "" }),
    signTransaction: () => Promise.resolve({ signedTxXdr: "" }),
  },
  isConnected: () => Promise.resolve({ isConnected: false }),
  getAddress: () => Promise.resolve({ address: "" }),
  signTransaction: () => Promise.resolve({ signedTxXdr: "" }),
}));

vi.mock('@creit.tech/stellar-wallets-kit', () => ({
  StellarWalletsKit: {
    init: () => {},
    authModal: () => Promise.resolve({ address: "" }),
    signTransaction: () => Promise.resolve({ signedTxXdr: "" }),
  },
  Networks: {
    TESTNET: "Test SDF Network ; September 2015"
  }
}));

import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../src/app/page';

describe('CarbonX Frontend App Tests', () => {
  test('renders the landing page initially', () => {
    render(<Home />);
    expect(screen.getByText('Carbon Markets for Every SME')).toBeDefined();
    expect(screen.getByText('Enter Terminal')).toBeDefined();
  });

  test('entering terminal switches screen to app workspace', () => {
    render(<Home />);
    const enterButton = screen.getByText('Enter Terminal');
    fireEvent.click(enterButton);

    // Should now show the active workspace sidebar element
    expect(screen.getByText('Overview Dashboard')).toBeDefined();
    expect(screen.getByText('Active Workspace')).toBeDefined();
  });

  test('clicking tabs changes visible content', () => {
    render(<Home />);
    fireEvent.click(screen.getByText('Enter Terminal'));

    // Switch to Marketplace tab
    const marketplaceBtn = screen.getByText('Marketplace');
    fireEvent.click(marketplaceBtn);

    expect(screen.getByText('Marketplace Terminal')).toBeDefined();
    expect(screen.getByText('Open Listings')).toBeDefined();
  });
});
