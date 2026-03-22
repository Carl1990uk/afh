import type { Location } from '../types/location';
import './LocationCard.css';

interface Props {
  location: Location;
  index: number;
}

export function LocationCard({ location, index }: Props) {
  const { name, address1, address2, city, postcode } = location;

  return (
    <article className='location-card' style={{ '--card-index': index } as React.CSSProperties} aria-label={`Office: ${name}`}>
      <h2 className='location-card__name'>{name}</h2>
      <address className='location-card__address'>
        {address1 && <span className='location-card__line'>{address1}</span>}
        {address2 && <span className='location-card__line'>{address2}</span>}
        {city && <span className='location-card__line'>{city}</span>}
        {postcode && <span className='location-card__line'>{postcode}</span>}
      </address>
    </article>
  );
}
