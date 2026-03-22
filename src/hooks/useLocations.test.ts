import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocations } from './useLocations';
import type { Location } from './../types/location';

const makeLocation = (n: number): Location => ({
  name: `Office ${n}`,
  address1: `${n} Street`,
  address2: '',
  city: 'London',
  postcode: `SW${n} 1AA`,
  number: '020 0000 0000',
  email: `office${n}@afhwm.co.uk`,
  map_url: 'https://maps.google.com',
  lat: '51.5',
  lon: '-0.1',
});

const LOCATIONS: Location[] = Array.from({ length: 12 }, (_, i) => makeLocation(i + 1));

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
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: false,
    status,
  });
}

describe('useLocations', () => {
  it('starts in a loading state', () => {
    mockFetchSuccess(LOCATIONS);
    const { result } = renderHook(() => useLocations());
    expect(result.current.loading).toBe(true);
    expect(result.current.visible).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('loads and exposes the first page of locations', async () => {
    mockFetchSuccess(LOCATIONS);
    const { result } = renderHook(() => useLocations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.total).toBe(12);
    expect(result.current.visible).toHaveLength(4);
    expect(result.current.visibleCount).toBe(4);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('sets an error message on a non-ok response', async () => {
    mockFetchError(503);
    const { result } = renderHook(() => useLocations());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error: 503');
    expect(result.current.visible).toHaveLength(0);
  });

  it('sets an error message when fetch rejects', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('No connection'));
    const { result } = renderHook(() => useLocations());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('No connection');
  });

  it('loadMore reveals the next page', async () => {
    mockFetchSuccess(LOCATIONS);
    const { result } = renderHook(() => useLocations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.loadMore());
    expect(result.current.visibleCount).toBe(8);
    expect(result.current.visible).toHaveLength(8);
    expect(result.current.hasMore).toBe(true);
  });

  it('loadMore does not exceed total count', async () => {
    mockFetchSuccess(LOCATIONS);
    const { result } = renderHook(() => useLocations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.loadMore());
    act(() => result.current.loadMore());

    expect(result.current.visibleCount).toBe(12);
    expect(result.current.hasMore).toBe(false);
  });

  it('hasMore is false when all locations are visible', async () => {
    const few = LOCATIONS.slice(0, 3);
    mockFetchSuccess(few);
    const { result } = renderHook(() => useLocations());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(false);
    expect(result.current.visible).toHaveLength(3);
  });
});
