import { useEffect, useRef, useState, useId } from 'react';
import { MdClose, MdMap } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location } from '../../types/location';
import './LocationMap.css';

// Fix default marker icons broken by Vite's asset pipeline
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'marker--selected',
});

function FlyTo({ location }: { location: Location | null }) {
  const map = useMap();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!location) return;
    const key = `${location.lat},${location.lon}`;
    if (key === prev.current) return;
    prev.current = key;
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      map.flyTo([lat, lon], 13, { duration: 1.2 });
    }
  }, [location, map]);

  return null;
}

interface Props {
  locations: Location[];
  selected: Location | null;
  onSelect: (location: Location) => void;
  onClose?: () => void;
}

export function LocationMap({ locations, selected, onSelect, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevOpen = useRef(false);
  const titleId = useId();

  useEffect(() => {
    if (selected) setOpen(true);
  }, [selected]);

  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    } else if (prevOpen.current) {
      fabRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const valid = locations.filter((l) => !isNaN(parseFloat(l.lat)) && !isNaN(parseFloat(l.lon)));

  const center: [number, number] = valid.length ? [parseFloat(valid[0].lat), parseFloat(valid[0].lon)] : [52.5, -1.9];

  return (
    <>
      {open && (
        <div className='map-panel'>
          <div className='map-panel__header'>
            <span id={titleId} className='map-panel__title'>
              {selected ? selected.name : 'All Offices'}
            </span>
            <button
              ref={closeRef}
              className='map-panel__close'
              onClick={() => {
                setOpen(false);
                onClose?.();
              }}
              aria-label='Close map'
            >
              <MdClose aria-hidden='true' />
            </button>
          </div>
          <MapContainer center={center} zoom={6} className='map-panel__map' scrollWheelZoom={false}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            {valid.map((loc, i) => (
              <Marker
                key={`${loc.name}-${i}`}
                position={[parseFloat(loc.lat), parseFloat(loc.lon)]}
                icon={selected?.name === loc.name ? selectedIcon : new L.Icon.Default()}
                eventHandlers={{ click: () => onSelect(loc) }}
              >
                <Popup>
                  <strong>{loc.name}</strong>
                  <br />
                  {loc.address1}
                  {loc.city ? `, ${loc.city}` : ''}
                </Popup>
              </Marker>
            ))}
            <FlyTo location={selected} />
          </MapContainer>
        </div>
      )}

      <button ref={fabRef} className='map-fab' onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close map' : 'View map'}>
        <MdMap aria-hidden='true' />
        {open ? 'Close Map' : 'View Map'}
      </button>
    </>
  );
}
