import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WalletBalance } from '../WalletBalance';

describe('WalletBalance', () => {
  const defaultProps = {
    balance: 5000,
    pendingTransactions: 0,
    onAddFunds: vi.fn(),
    onSettleTransactions: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders wallet balance correctly', () => {
    render(<WalletBalance {...defaultProps} />);

    expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByText('units available')).toBeInTheDocument();
  });

  it('calls onAddFunds when add funds button is clicked', async () => {
    const user = userEvent.setup();
    render(<WalletBalance {...defaultProps} />);

    const addFundsButton = screen.getByText('Add Funds');
    await user.click(addFundsButton);

    expect(defaultProps.onAddFunds).toHaveBeenCalled();
  });

  it('calls onAddFunds when top up button is clicked', async () => {
    const user = userEvent.setup();
    render(<WalletBalance {...defaultProps} />);

    const topUpButton = screen.getByText('Top Up');
    await user.click(topUpButton);

    expect(defaultProps.onAddFunds).toHaveBeenCalled();
  });

  it('shows pending transactions section when there are pending transactions', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={3} />);

    expect(screen.getByText('Pending Transactions')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('⚡ Auto-settlement recommended - Save gas fees!')).toBeInTheDocument();
  });

  it('shows different message when below settlement threshold', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={1} />);

    expect(screen.getByText('Pending Transactions')).toBeInTheDocument();
    expect(screen.getByText('Transactions will settle automatically when threshold is reached')).toBeInTheDocument();
  });

  it('shows gas savings when multiple transactions are pending', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={2} />);

    expect(screen.getByText('Save 50% on gas fees with batch settlement')).toBeInTheDocument();
  });

  it('calls onSettleTransactions when settle button is clicked', async () => {
    const user = userEvent.setup();
    render(<WalletBalance {...defaultProps} pendingTransactions={3} />);

    const settleButton = screen.getByText('Settle 3 Transactions (Recommended)');
    await user.click(settleButton);

    expect(defaultProps.onSettleTransactions).toHaveBeenCalled();
  });

  it('disables settle button when no pending transactions', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={0} />);

    const settleButton = screen.queryByText(/Settle/);
    expect(settleButton).not.toBeInTheDocument();
  });

  it('disables settle button when loading', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={3} isLoading={true} />);

    const settleButton = screen.getByText('Settling...');
    expect(settleButton).toBeDisabled();
  });

  it('shows recommended text when threshold is reached', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={5} />);

    const settleButton = screen.getByText('Settle 5 Transactions (Recommended)');
    expect(settleButton).toBeInTheDocument();
  });

  it('shows regular settle button for single pending transaction', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={1} />);

    const settleButton = screen.queryByText(/Settle/);
    expect(settleButton).not.toBeInTheDocument(); // Shouldn't show for single transaction
  });

  it('calculates gas savings correctly', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={4} />);

    expect(screen.getByText('Save 75% on gas fees with batch settlement')).toBeInTheDocument();
  });

  it('shows power information text', () => {
    render(<WalletBalance {...defaultProps} />);

    expect(screen.getByText('Powered by Linera microchain technology')).toBeInTheDocument();
    expect(screen.getByText('66% gas savings through batch settlement')).toBeInTheDocument();
  });

  it('shows transactions button', () => {
    render(<WalletBalance {...defaultProps} />);

    const transactionsButton = screen.getByText('Transactions');
    expect(transactionsButton).toBeInTheDocument();
  });

  it('displays quick actions section', () => {
    render(<WalletBalance {...defaultProps} />);

    expect(screen.getByText('Top Up')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('shows auto-settlement badge when recommended', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={3} />);

    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('handles different settlement thresholds correctly', () => {
    const { rerender } = render(<WalletBalance {...defaultProps} pendingTransactions={2} />);

    // Should not show recommended for 2 transactions
    expect(screen.queryByText('Recommended')).not.toBeInTheDocument();

    // Should show recommended for 3+ transactions
    rerender(<WalletBalance {...defaultProps} pendingTransactions={3} />);
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('shows correct transaction count in messages', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={5} />);

    expect(screen.getByText('Settle 5 Transactions (Recommended)')).toBeInTheDocument();
  });

  it('updates button text when settling', () => {
    render(<WalletBalance {...defaultProps} pendingTransactions={3} isLoading={true} />);

    expect(screen.getByText('Settling...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Settling...');
  });
});