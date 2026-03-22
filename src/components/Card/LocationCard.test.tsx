import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationCard } from './LocationCard';
import type { Location } from '../../types/location';

const baseLocation: Location = {
  name: 'Birmingham Office',
  address1: '123 High Street',
  address2: 'Colmore Row',
  city: 'Birmingham',
  postcode: 'B1 1AA',
  number: '0121 000 0000',
  email: 'birmingham@afhwm.co.uk',
  map_url: 'https://maps.google.com',
  lat: '52.4862',
  lon: '-1.8904',
};

describe('LocationCard', () => {
  it('renders the office name', () => {
    render(<LocationCard location={baseLocation} index={0} />);
    expect(screen.getByText('Birmingham Office')).toBeInTheDocument();
  });

  it('has an aria-label containing the office name', () => {
    render(<LocationCard location={baseLocation} index={0} />);
    expect(screen.getByRole('article', { name: 'Office: Birmingham Office' })).toBeInTheDocument();
  });

  it('renders all address fields', () => {
    render(<LocationCard location={baseLocation} index={0} />);
    expect(screen.getByText('123 High Street')).toBeInTheDocument();
    expect(screen.getByText('Colmore Row')).toBeInTheDocument();
    expect(screen.getByText('Birmingham')).toBeInTheDocument();
    expect(screen.getByText('B1 1AA')).toBeInTheDocument();
  });

  it('omits empty address fields', () => {
    const sparse: Location = { ...baseLocation, address2: '', city: '' };
    render(<LocationCard location={sparse} index={0} />);
    expect(screen.queryByText('Colmore Row')).not.toBeInTheDocument();
    expect(screen.queryByText('Birmingham')).not.toBeInTheDocument();
    expect(screen.getByText('123 High Street')).toBeInTheDocument();
    expect(screen.getByText('B1 1AA')).toBeInTheDocument();
  });

  it('sets the --card-index CSS custom property', () => {
    const { container } = render(<LocationCard location={baseLocation} index={3} />);
    const article = container.querySelector('article');
    expect(article?.getAttribute('style')).toContain('--card-index: 3');
  });

  it('applies the selected class when isSelected is true', () => {
    const { container } = render(<LocationCard location={baseLocation} index={0} isSelected />);
    expect(container.querySelector('article')).toHaveClass('location-card--selected');
  });

  it('does not apply the selected class when isSelected is false', () => {
    const { container } = render(<LocationCard location={baseLocation} index={0} isSelected={false} />);
    expect(container.querySelector('article')).not.toHaveClass('location-card--selected');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<LocationCard location={baseLocation} index={0} onClick={onClick} />);
    await userEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter is pressed', async () => {
    const onClick = vi.fn();
    render(<LocationCard location={baseLocation} index={0} onClick={onClick} />);
    screen.getByRole('article').focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when other keys are pressed', async () => {
    const onClick = vi.fn();
    render(<LocationCard location={baseLocation} index={0} onClick={onClick} />);
    screen.getByRole('article').focus();
    await userEvent.keyboard('{Space}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not throw when clicked with no onClick prop', async () => {
    render(<LocationCard location={baseLocation} index={0} />);
    await expect(userEvent.click(screen.getByRole('article'))).resolves.not.toThrow();
  });
});
