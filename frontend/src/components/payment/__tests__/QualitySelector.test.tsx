import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QualitySelector, type QualityTier } from '../QualitySelector';

describe('QualitySelector', () => {
  const defaultProps = {
    currentQuality: 'Standard',
    availableTiers: [
      {
        quality: 'Standard',
        price: 0,
        resolution: '480p',
        features: ['Mobile optimized', 'Lower data usage'],
        icon: <div data-testid="standard-icon" />,
      },
      {
        quality: 'High',
        price: 200,
        resolution: '720p-1080p',
        features: ['HD quality', 'Better audio'],
        icon: <div data-testid="high-icon" />,
        popular: true,
      },
      {
        quality: 'Premium',
        price: 500,
        resolution: '1080p+',
        features: ['Full HD', 'Enhanced audio'],
        icon: <div data-testid="premium-icon" />,
      },
      {
        quality: 'Ultra',
        price: 2000,
        resolution: '4K',
        features: ['4K quality', 'Best audio'],
        icon: <div data-testid="ultra-icon" />,
        recommended: true,
      },
    ],
    userBalance: 5000,
    onQualityUpgrade: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders quality selector correctly', () => {
    render(<QualitySelector {...defaultProps} />);

    expect(screen.getByText('Stream Quality')).toBeInTheDocument();
    expect(screen.getByText('Choose your preferred video quality for the best experience')).toBeInTheDocument();
    expect(screen.getByText('Your Balance')).toBeInTheDocument();
    expect(screen.getByText('5,000 units')).toBeInTheDocument();
  });

  it('displays all available quality tiers', () => {
    render(<QualitySelector {...defaultProps} />);

    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Ultra')).toBeInTheDocument();

    expect(screen.getByText('Free')).toBeInTheDocument(); // Standard price
    expect(screen.getByText('200 units')).toBeInTheDocument(); // High price
    expect(screen.getByText('500 units')).toBeInTheDocument(); // Premium price
    expect(screen.getByText('2000 units')).toBeInTheDocument(); // Ultra price
  });

  it('shows popular and recommended badges', () => {
    render(<QualitySelector {...defaultProps} />);

    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('displays current quality status', () => {
    render(<QualitySelector {...defaultProps} />);

    expect(screen.getByText('Currently Streaming in Standard')).toBeInTheDocument();
    expect(screen.getByText('480p quality with all selected features')).toBeInTheDocument();
  });

  it('calls onQualityUpgrade when upgrade button is clicked', async () => {
    const user = userEvent.setup();
    render(<QualitySelector {...defaultProps} />);

    // Select High quality
    const highQualityRadio = screen.getByLabelText('High');
    await user.click(highQualityRadio);

    // Click upgrade button
    const upgradeButton = screen.getByText('Upgrade to High');
    await user.click(upgradeButton);

    expect(defaultProps.onQualityUpgrade).toHaveBeenCalledWith('High', 200);
  });

  it('shows upgrade cost when different quality is selected', async () => {
    const user = userEvent.setup();
    render(<QualitySelector {...defaultProps} />);

    // Select Premium quality
    const premiumRadio = screen.getByLabelText('Premium');
    await user.click(premiumRadio);

    expect(screen.getByText('Upgrade Cost:')).toBeInTheDocument();
    expect(screen.getByText('500 units')).toBeInTheDocument();
    expect(screen.getByText('Your Balance: 5,000 units')).toBeInTheDocument();
  });

  it('disables upgrade button when user cannot afford', async () => {
    const user = userEvent.setup();
    render(<QualitySelector {...defaultProps} userBalance={100} />);

    // Select Ultra quality (2000 units)
    const ultraRadio = screen.getByLabelText('Ultra');
    await user.click(ultraRadio);

    const upgradeButton = screen.getByText('Upgrade to Ultra');
    expect(upgradeButton).toBeDisabled();
    expect(screen.getByText('Insufficient balance (need 1900 more units)')).toBeInTheDocument();
  });

  it('disables upgrade button when loading', () => {
    render(<QualitySelector {...defaultProps} isLoading={true} />);

    const upgradeButton = screen.getByText('Upgrade to High');
    expect(upgradeButton).toBeDisabled();
  });

  it('handles custom amount input', async () => {
    const user = userEvent.setup();
    render(<QualitySelector {...defaultProps} />);

    const customInput = screen.getByPlaceholderText('Min: 50 units');
    await user.type(customInput, '150');

    // Should update selected amount
    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
  });

  it('validates custom amount below minimum', async () => {
    const user = userEvent.setup();
    render(<QualitySelector {...defaultProps} />);

    const customInput = screen.getByPlaceholderText('Min: 50 units');
    await user.type(customInput, '25');

    // Should keep previous selection (Standard is free)
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
  });

  it('displays quality features correctly', async () => {
    const user = userEvent.setup();
    render(<QualitySelector {...defaultProps} />);

    const premiumRadio = screen.getByLabelText('Premium');
    await user.click(premiumRadio);

    expect(screen.getByText('Full HD')).toBeInTheDocument();
    expect(screen.getByText('Enhanced audio')).toBeInTheDocument();
  });

  it('shows progress bar for balance coverage', async () => {
    const user = userEvent.setup();
    render(<QualitySelector {...defaultProps} userBalance={1000} />);

    const ultraRadio = screen.getByLabelText('Ultra');
    await user.click(ultraRadio);

    // Should show progress bar at 50% (1000/2000)
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('updates current quality indicator', () => {
    render(<QualitySelector {...defaultProps} currentQuality="High" />);

    expect(screen.getByText('Currently Streaming in High')).toBeInTheDocument();
  });

  it('handles free quality selection without upgrade button', async () => {
    const user = userEvent.setup();
    render(<QualitySelector {...defaultProps} currentQuality="High" />);

    // Select Standard (free)
    const standardRadio = screen.getByLabelText('Standard');
    await user.click(standardRadio);

    // Should not show upgrade section since it's free and no cost difference
    expect(screen.queryByText('Upgrade Cost:')).not.toBeInTheDocument();
  });

  it('disables quality options when user cannot afford them', () => {
    render(<QualitySelector {...defaultProps} userBalance={100} />);

    // Premium and Ultra should be disabled
    const premiumRadio = screen.getByLabelText('Premium');
    const ultraRadio = screen.getByLabelText('Ultra');

    expect(premiumRadio).toBeDisabled();
    expect(ultraRadio).toBeDisabled();

    // Standard and High should be enabled
    const standardRadio = screen.getByLabelText('Standard');
    const highRadio = screen.getByLabelText('High');

    expect(standardRadio).not.toBeDisabled();
    expect(highRadio).not.toBeDisabled();
  });

  it('shows processing state when loading', () => {
    render(<QualitySelector {...defaultProps} isLoading={true} />);

    const upgradeButton = screen.getByText('Upgrade to High');
    expect(upgradeButton).toHaveTextContent('Processing...');
  });
});