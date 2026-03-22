import { MdArrowDownward, MdErrorOutline } from 'react-icons/md';
import { useLocations } from '../../hooks/useLocations';
import { LocationCard } from '../Card/LocationCard';
import './LocationFeed.css';
import { LocationMap } from '../Map/LocationMap';
import type { Location } from '../../types/location';
import { useState } from 'react';

export function LocationFeed() {
  const { visible, total, visibleCount, loading, error, loadMore, hasMore, all } = useLocations();
  const [selected, setSelected] = useState<Location | null>(null);
  if (loading) {
    return (
      <div className='feed__state'>
        <div className='feed__spinner' aria-label='Loading locations' role='status' />
        <p className='feed__state-text'>Loading office locations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='feed__state feed__state--error' role='alert'>
        <MdErrorOutline className='feed__error-icon' aria-hidden='true' />
        <p className='feed__state-text'>{error}</p>
      </div>
    );
  }
  return (
    <section className='feed' aria-label='Office locations'>
      <LocationMap locations={all} selected={selected} onSelect={setSelected} onClose={() => setSelected(null)} />

      <p className='feed__count' aria-live='polite' aria-atomic='true'>
        Showing <strong>{visibleCount}</strong> of <strong>{total}</strong> offices
      </p>
      <ul className='feed__grid' role='list'>
        {visible.map((loc, i) => (
          <li key={`${loc.name}-${i}`} role='listitem'>
            <LocationCard location={loc} index={i} isSelected={selected?.name === loc.name} onClick={() => setSelected(loc)} />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className='feed__footer'>
          <button className='feed__load-more' onClick={loadMore} aria-label='Load more office locations'>
            Load More
            <MdArrowDownward aria-hidden='true' />
          </button>
        </div>
      )}

      {!hasMore && visible.length > 0 && <p className='feed__end'>All {total} offices shown</p>}
    </section>
  );
}
