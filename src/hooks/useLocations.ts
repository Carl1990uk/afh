import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../types/location';

const API_URL = '/api/v1/locations';
const PAGE_SIZE = 4;

interface UseLocationsReturn {
  visible: Location[];
  total: number;
  visibleCount: number;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
}

/**
 * Fetches all AFH locations from the API and manages paginated display.
 *
 * Loads up to 12 locations on mount, then exposes `loadMore` to reveal
 * additional results in increments of 4.
 *
 * @returns {UseLocationsReturn}
 *   - `visible`      — the currently displayed slice of locations
 *   - `total`        — total number of locations fetched
 *   - `visibleCount` — how many locations are currently shown
 *   - `loading`      — true while the initial fetch is in flight
 *   - `error`        — error message string, or null if no error
 *   - `loadMore`     — call to reveal the next page of locations
 *   - `hasMore`      — true if there are hidden locations remaining
 */
export function useLocations(): UseLocationsReturn {
  const [all, setAll] = useState<Location[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLocations() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        const data: Location[] = await res.json();
        if (!cancelled) setAll(data.slice(0, 12));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load locations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, all.length));
  }, [all.length]);

  return {
    visible: all.slice(0, visibleCount),
    total: all.length,
    visibleCount,
    loading,
    error,
    loadMore,
    hasMore: visibleCount < all.length,
  };
}
