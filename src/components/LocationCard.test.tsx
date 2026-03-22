import { render, screen } from '@testing-library/react';
import { LocationCard } from './LocationCard';
import type { Location } from './../types/location';

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
});
