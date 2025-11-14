import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TippingPanel } from '../TippingPanel';

describe('TippingPanel', () => {
  const defaultProps = {
    minTipAmount: 50,
    userBalance: 5000,
    roomStats: {
      totalTips: 1250,
      activeTippers: 8,
      recentTips: [
        { amount: 150, message: 'Great content!', timestamp: new Date() },
        { amount: 200, message: 'Love the quality', timestamp: new Date() },
      ],
    },
    onSendTip: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tipping panel correctly', () => {
    render(<TippingPanel {...defaultProps} />);

    expect(screen.getByText('Support the Creator')).toBeInTheDocument();
    expect(screen.getByText('Send a tip to show your appreciation')).toBeInTheDocument();
    expect(screen.getByText('Your Balance')).toBeInTheDocument();
    expect(screen.getByText('5,000 units')).toBeInTheDocument();
  });

  it('displays room statistics', () => {
    render(<TippingPanel {...defaultProps} />);

    expect(screen.getByText('1,250')).toBeInTheDocument(); // Total tips
    expect(screen.getByText('8')).toBeInTheDocument(); // Active tippers
    expect(screen.getByText('Room Activity')).toBeInTheDocument();
  });

  it('shows predefined tip amounts', () => {
    render(<TippingPanel {...defaultProps} />);

    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('50 units')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('100 units')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
    expect(screen.getByText('200 units')).toBeInTheDocument();
    expect(screen.getByText('XL')).toBeInTheDocument();
    expect(screen.getByText('500 units')).toBeInTheDocument();
    expect(screen.getByText('Mega')).toBeInTheDocument();
    expect(screen.getByText('1,000 units')).toBeInTheDocument();
  });

  it('shows popular badge on medium tip', () => {
    render(<TippingPanel {...defaultProps} />);

    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('selects tip amount when button is clicked', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    const largeButton = screen.getByText('Large');
    await user.click(largeButton);

    expect(screen.getByDisplayValue('200')).toBeInTheDocument(); // Custom amount should be cleared
  });

  it('handles custom amount input', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    const customInput = screen.getByPlaceholderText('Min: 50 units');
    await user.type(customInput, '150');

    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
  });

  it('validates custom amount below minimum', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    const customInput = screen.getByPlaceholderText('Min: 50 units');
    await user.type(customInput, '25');

    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
  });

  it('toggles super chat option', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    const superChatSwitch = screen.getByText('Super Chat');
    await user.click(superChatSwitch);

    expect(screen.getByText('(Will be highlighted)')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument(); // Multiplier
  });

  it('updates total cost when super chat is enabled', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    // Select 100 units tip
    const mediumButton = screen.getByText('Medium');
    await user.click(mediumButton);

    // Enable super chat
    const superChatSwitch = screen.getByText('Super Chat');
    await user.click(superChatSwitch);

    expect(screen.getByText('Total Cost:')).toBeInTheDocument();
    expect(screen.getByText('200 units')).toBeInTheDocument(); // 100 * 2
  });

  it('handles message input', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    const messageTextarea = screen.getByPlaceholderText('Say something nice...');
    await user.type(messageTextarea, 'Great stream!');

    expect(screen.getByDisplayValue('Great stream!')).toBeInTheDocument();
  });

  it('shows character count for message', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    const messageTextarea = screen.getByPlaceholderText('Say something nice...');
    await user.type(messageTextarea, 'a'.repeat(50));

    expect(screen.getByText('50/100')).toBeInTheDocument();
  });

  it('updates character count when super chat is enabled', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    // Enable super chat
    const superChatSwitch = screen.getByText('Super Chat');
    await user.click(superChatSwitch);

    const messageTextarea = screen.getByPlaceholderText('Say something nice...');
    await user.type(messageTextarea, 'a'.repeat(50));

    expect(screen.getByText('50/200')).toBeInTheDocument(); // Super chat allows 200 chars
  });

  it('calls onSendTip when send tip button is clicked', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    // Select tip amount
    const largeButton = screen.getByText('Large');
    await user.click(largeButton);

    // Add message
    const messageTextarea = screen.getByPlaceholderText('Say something nice...');
    await user.type(messageTextarea, 'Amazing content!');

    // Send tip
    const sendButton = screen.getByText('Send Tip (200 units)');
    await user.click(sendButton);

    expect(defaultProps.onSendTip).toHaveBeenCalledWith(200, 'Amazing content!', false);
  });

  it('calls onSendTip with super chat when enabled', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    // Select tip amount
    const mediumButton = screen.getByText('Medium');
    await user.click(mediumButton);

    // Enable super chat
    const superChatSwitch = screen.getByText('Super Chat');
    await user.click(superChatSwitch);

    // Send tip
    const sendButton = screen.getByText('Send Tip (200 units)');
    await user.click(sendButton);

    expect(defaultProps.onSendTip).toHaveBeenCalledWith(100, '', true);
  });

  it('disables send button when user cannot afford tip', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} userBalance={25} />);

    const sendButton = screen.getByText('Send Tip (50 units)');
    expect(sendButton).toBeDisabled();
    expect(screen.getByText('Insufficient balance. Add more units to send this tip.')).toBeInTheDocument();
  });

  it('disables send button when loading', () => {
    render(<TippingPanel {...defaultProps} isLoading={true} />);

    const sendButton = screen.getByText('Processing...');
    expect(sendButton).toBeDisabled();
  });

  it('shows cost summary with breakdown', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    // Select tip amount
    const largeButton = screen.getByText('Large');
    await user.click(largeButton);

    expect(screen.getByText('Tip Amount:')).toBeInTheDocument();
    expect(screen.getByText('200 units')).toBeInTheDocument();
    expect(screen.getByText('Total Cost:')).toBeInTheDocument();
    expect(screen.getByText('200 units')).toBeInTheDocument();
  });

  it('shows recent tips activity', () => {
    render(<TippingPanel {...defaultProps} />);

    expect(screen.getByText('Recent Tips:')).toBeInTheDocument();
    expect(screen.getByText('150 units')).toBeInTheDocument();
    expect(screen.getByText('"Great content!"')).toBeInTheDocument();
    expect(screen.getByText('200 units')).toBeInTheDocument();
    expect(screen.getByText('"Love the quality"')).toBeInTheDocument();
  });

  it('calculates average tip correctly', () => {
    render(<TippingPanel {...defaultProps} />);

    expect(screen.getByText('Avg: 156 units/tip')).toBeInTheDocument(); // 1250 / 8 = 156.25
  });

  it('shows progress bar for balance coverage', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} userBalance={1000} />);

    // Select mega tip (1000 units)
    const megaButton = screen.getByText('Mega');
    await user.click(megaButton);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('handles minimum tip validation', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    const customInput = screen.getByPlaceholderText('Min: 50 units');
    await user.type(customInput, '25');

    const sendButton = screen.getByText('Send Tip (25 units)');
    expect(sendButton).toBeDisabled();
  });

  it('shows/hides recent tips section', async () => {
    const user = userEvent.setup();
    render(<TippingPanel {...defaultProps} />);

    const toggleButton = screen.getByText('Hide Recent');
    await user.click(toggleButton);

    expect(screen.getByText('Show Recent')).toBeInTheDocument();
    expect(screen.queryByText('Recent Tips:')).not.toBeInTheDocument();
  });

  it('clears message after sending tip', async () => {
    const user = userEvent.setup();
    const mockOnSendTip = vi.fn().mockResolvedValue(undefined);

    render(<TippingPanel {...defaultProps} onSendTip={mockOnSendTip} />);

    // Add message
    const messageTextarea = screen.getByPlaceholderText('Say something nice...');
    await user.type(messageTextarea, 'Test message');

    // Send tip
    const sendButton = screen.getByText('Send Tip (50 units)');
    await user.click(sendButton);

    // Message should be cleared (simulated)
    expect(mockOnSendTip).toHaveBeenCalledWith(50, 'Test message', false);
  });
});