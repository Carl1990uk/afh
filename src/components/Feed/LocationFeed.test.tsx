import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { LocationFeed } from './LocationFeed';
import type { Location } from '../../types/location';

// Mock Leaflet internals so LocationMap renders safely in jsdom
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
  return { default: { Icon, icon: vi.fn() }, Icon };
});

const makeLocation = (n: number): Location => ({
  name: `Office ${n}`,
  address1: `${n} Main St`,
  address2: '',
  city: 'London',
  postcode: `EC${n}N 1AA`,
  number: '020 0000 0000',
  email: `office${n}@afhwm.co.uk`,
  map_url: 'https://maps.google.com',
  lat: '51.5',
  lon: '-0.1',
});

const LOCATIONS: Location[] = Array.from({ length: 8 }, (_, i) => makeLocation(i + 1));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetchSuccess(data: Location[]) {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(status = 500) {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status });
}

describe('LocationFeed', () => {
  it('shows a loading spinner while fetching', () => {
    // Never-resolving mock: no state update fires after the test exits
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    render(<LocationFeed />);
    expect(screen.getByRole('status', { name: 'Loading locations' })).toBeInTheDocument();
    expect(screen.getByText('Loading office locations…')).toBeInTheDocument();
  });

  it('renders location cards after a successful fetch', async () => {
    mockFetchSuccess(LOCATIONS);
    render(<LocationFeed />);

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    expect(screen.getByText('Office 1')).toBeInTheDocument();
    expect(screen.getByText('Office 4')).toBeInTheDocument();
    expect(screen.queryByText('Office 5')).not.toBeInTheDocument();
  });

  it('shows the count summary', async () => {
    mockFetchSuccess(LOCATIONS);
    render(<LocationFeed />);

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('shows a Load More button when there are more results', async () => {
    mockFetchSuccess(LOCATIONS);
    render(<LocationFeed />);

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
  });

  it('loads the next page when Load More is clicked', async () => {
    mockFetchSuccess(LOCATIONS);
    render(<LocationFeed />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /load more/i }));

    expect(screen.getByText('Office 5')).toBeInTheDocument();
    expect(screen.getByText('Office 8')).toBeInTheDocument();
  });

  it('hides Load More and shows end message when all offices are visible', async () => {
    mockFetchSuccess(LOCATIONS);
    render(<LocationFeed />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /load more/i }));

    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    expect(screen.getByText('All 8 offices shown')).toBeInTheDocument();
  });

  it('shows an error alert on fetch failure', async () => {
    mockFetchError(503);
    render(<LocationFeed />);

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Network error: 503');
  });

  it('selecting a card opens the map and shows the location name', async () => {
    mockFetchSuccess(LOCATIONS);
    render(<LocationFeed />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('article', { name: 'Office: Office 1' }));

    expect(screen.getByText('Office 1', { selector: '.map-panel__title' })).toBeInTheDocument();
  });

  it('selecting a different card updates the map title', async () => {
    mockFetchSuccess(LOCATIONS);
    render(<LocationFeed />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('article', { name: 'Office: Office 1' }));
    await userEvent.click(screen.getByRole('article', { name: 'Office: Office 2' }));

    expect(screen.getByText('Office 2', { selector: '.map-panel__title' })).toBeInTheDocument();
  });

  it('applies the selected class to the clicked card', async () => {
    mockFetchSuccess(LOCATIONS);
    render(<LocationFeed />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    const card = screen.getByRole('article', { name: 'Office: Office 1' });
    await userEvent.click(card);

    expect(card).toHaveClass('location-card--selected');
  });

  it('shows no Load More when result count is within one page', async () => {
    mockFetchSuccess(LOCATIONS.slice(0, 3));
    render(<LocationFeed />);

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    expect(screen.getByText('All 3 offices shown')).toBeInTheDocument();
  });
});
