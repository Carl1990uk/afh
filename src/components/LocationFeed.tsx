import { useLocations } from '../hooks/useLocations';
import './LocationFeed.css';

export function LocationFeed() {
  const { visible, total, visibleCount, loadMore, hasMore } = useLocations();
  return (
    <section className='feed' aria-label='Office locations'>
      <p className='feed__count'>
        Showing <strong>{visibleCount}</strong> of <strong>{total}</strong> offices
      </p>
      <ul className='feed__grid' role='list'>
        {visible.map((loc, i) => (
          <li key={`${loc.name}-${i}`} role='listitem'>
            <p>Location of {i + 1}</p>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className='feed__footer'>
          <button className='feed__load-more' onClick={loadMore} aria-label='Load more office locations'>
            Load More
          </button>
        </div>
      )}

      {!hasMore && visible.length > 0 && <p className='feed__end'>All {total} offices shown</p>}
    </section>
  );
}
