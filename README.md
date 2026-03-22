# AFH Locations

A React app that displays AFH Wealth Management office locations across the UK, with paginated cards and an interactive map.

## Features

- Fetches office locations from the AFH API
- Paginated card grid (4 per page) with animated entry
- Interactive Leaflet map — clicking a card opens the map and flies to that location
- Clicking a map marker highlights the corresponding card
- Responsive layout with a sticky header and purple brand theme

## Getting started

```bash
npm install
npm run dev
```

The dev server proxies `/api/v1/locations` to `https://www.afhwm.co.uk` so no CORS configuration is needed locally.

## Scripts

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start the dev server                |
| `npm run build`      | Type-check and build for production |
| `npm run preview`    | Preview the production build        |
| `npm test`           | Run the test suite                  |
| `npm run test:watch` | Run tests in watch mode             |
| `npm run lint`       | Lint with ESLint                    |

## API

Locations are fetched from:

```
GET /api/v1/locations
```

Each location returns:

```ts
interface Location {
  name: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  number: string;
  email: string;
  map_url: string;
  lat: string;
  lon: string;
}
```
