import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { LocationMap } from './LocationMap';
import type { Location } from '../../types/location';

// Leaflet cannot run in jsdom — mock the map components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid='map'>{children}</div>,
  TileLayer: () => null,
  Marker: ({ children, eventHandlers }: { children: React.ReactNode; eventHandlers?: { click?: () => void } }) => (
    <div data-testid='marker' onClick={eventHandlers?.click}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useMap: () => ({ flyTo: vi.fn() }),
}));

vi.mock('leaflet', () => {
  class Icon {
    constructor() {}
    static Default = class {
      static mergeOptions() {}
      prototype: object = {};
    };
  }
  return {
    default: { Icon, icon: vi.fn() },
    Icon,
  };
});

const makeLocation = (n: number): Location => ({
  name: `Office ${n}`,
  address1: `${n} High Street`,
  address2: '',
  city: 'London',
  postcode: `SW${n} 1AA`,
  number: '020 0000 0000',
  email: `office${n}@afhwm.co.uk`,
  map_url: '',
  lat: '51.5',
  lon: '-0.1',
});

const locations = [makeLocation(1), makeLocation(2), makeLocation(3)];

describe('LocationMap', () => {
  it('renders the FAB with "View Map" label', () => {
    render(<LocationMap locations={locations} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'View map' })).toBeInTheDocument();
    expect(screen.getByText('View Map')).toBeInTheDocument();
  });

  it('does not show the map panel on initial render', () => {
    render(<LocationMap locations={locations} selected={null} onSelect={vi.fn()} />);
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
  });

  it('opens the map panel when FAB is clicked', async () => {
    render(<LocationMap locations={locations} selected={null} onSelect={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'View map' }));
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('shows "All Offices" in the panel header when nothing is selected', async () => {
    render(<LocationMap locations={locations} selected={null} onSelect={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'View map' }));
    expect(screen.getByText('All Offices')).toBeInTheDocument();
  });

  it('shows the selected location name in the panel header', () => {
    // map auto-opens when selected is provided
    render(<LocationMap locations={locations} selected={locations[0]} onSelect={vi.fn()} />);
    expect(screen.getByText('Office 1', { selector: '.map-panel__title' })).toBeInTheDocument();
  });

  it('closes the panel when the close button is clicked', async () => {
    render(<LocationMap locations={locations} selected={null} onSelect={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'View map' }));
    expect(screen.getByTestId('map')).toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', { name: 'Close map' });
    await userEvent.click(closeButtons[0]);
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
  });

  it('toggles the FAB label between "View Map" and "Close Map"', async () => {
    render(<LocationMap locations={locations} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText('View Map')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View map' }));
    expect(screen.getByText('Close Map')).toBeInTheDocument();
  });

  it('opens automatically when a selected location is provided', () => {
    render(<LocationMap locations={locations} selected={locations[0]} onSelect={vi.fn()} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('shows the selected location name in the header when auto-opened', () => {
    render(<LocationMap locations={locations} selected={locations[1]} onSelect={vi.fn()} />);
    expect(screen.getByText('Office 2', { selector: '.map-panel__title' })).toBeInTheDocument();
  });

  it('calls onSelect with the clicked location', async () => {
    const onSelect = vi.fn();
    render(<LocationMap locations={locations} selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'View map' }));
    await userEvent.click(screen.getAllByTestId('marker')[0]);
    expect(onSelect).toHaveBeenCalledWith(locations[0]);
  });

  it('filters out locations with invalid coordinates', async () => {
    const withBadCoords: Location[] = [...locations, { ...makeLocation(4), lat: 'invalid', lon: 'invalid' }];
    render(<LocationMap locations={withBadCoords} selected={null} onSelect={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'View map' }));
    expect(screen.getAllByTestId('marker')).toHaveLength(3);
  });

  it('renders when all locations have invalid coordinates', async () => {
    const allBad: Location[] = [
      { ...makeLocation(1), lat: 'NaN', lon: 'NaN' },
      { ...makeLocation(2), lat: '', lon: '' },
    ];
    render(<LocationMap locations={allBad} selected={null} onSelect={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'View map' }));
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);
  });
});
