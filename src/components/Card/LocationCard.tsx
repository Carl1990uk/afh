import type { Location } from '../../types/location';
import './LocationCard.css';

interface Props {
  location: Location;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function LocationCard({ location, index, isSelected, onClick }: Props) {
  const { name, address1, address2, city, postcode } = location;

  return (
    <article
      className={`location-card${isSelected ? ' location-card--selected' : ''}`}
      style={{ '--card-index': index } as React.CSSProperties}
      aria-label={`Office: ${name}${isSelected ? ' (selected)' : ''}`}
      aria-current={isSelected || undefined}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick?.())}
    >
      <div className='location-card__content'>
        <h2 className='location-card__name'>{name}</h2>
        <address className='location-card__address'>
          {address1 && <span className='location-card__line'>{address1}</span>}
          {address2 && <span className='location-card__line'>{address2}</span>}
          {city && <span className='location-card__line'>{city}</span>}
          {postcode && <span className='location-card__line'>{postcode}</span>}
        </address>
      </div>
    </article>
  );
}
