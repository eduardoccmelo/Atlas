# Atlas — Travel Organizer

Atlas is a personal travel organizer for planning trips, keeping the details of each journey together, and visualizing the countries you have visited. It is a responsive, visual-first single-page application that works on desktop and mobile screens.

## Highlights

- Create, view, edit, and remove trips.
- Keep destination, start, and end dates together at the top of every trip.
- Build detailed transport entries for flights, buses, and trains.
- Add multiple transport legs, including flight connections.
- Autocomplete airports and cities, calculate travel distance, and calculate duration from the entered dates and times.
- Account for airport time zones when calculating flight duration.
- Record optional car rental and accommodation details.
- Maintain sightseeing items, expenses, and free-form notes for each trip.
- Browse a world map, select visited countries, search the country list, and see your visited-country total.
- Store trip data and visited countries locally in the browser, so no account is required.

## Travel planning details

### Trips

Each trip uses a boarding-pass-inspired card with quick actions for viewing, editing, and deleting. The card resolves a destination to its country and displays that country’s flag; when the place cannot be resolved, it uses a neutral world-map image instead.

### Transport

The transport form supports multiple entries and keeps fields relevant to the selected travel type.

- **Flight:** airline, booking reference, flight number, seats, airports, departure date/time, arrival time, calculated distance, and time-zone-aware duration.
- **Bus and train:** operator, booking/ticket details, seats, cities, dates/times, calculated duration, and distance.
- **Car rental:** company, vehicle, reservation number, pick-up/drop-off dates and times, fuel, transmission, and optional alternate drop-off location.

### Accommodation and trip notes

Add more than one accommodation, with booking provider, reservation, dates, times, and address. Sightseeings, expenses, and a free-text notes area make it easy to keep the smaller details in one place.

## Tech stack

- React 17 and React Router
- Create React App
- Mapbox GL via `react-map-gl`
- `use-supercluster` for map marker clustering
- `airports` and `tz-lookup` for airport and time-zone data
- Framer Motion for interface transitions
- Browser `localStorage` for persistence

## Run locally

### Requirements

- Node.js 16+ is recommended.
- A Mapbox public access token is required for the interactive map and city autocomplete.

### Install

```bash
npm install
```

Create a `.env` file in the project root:

```dotenv
REACT_APP_MAPBOX_KEY=your_mapbox_public_token
```

Start the development server:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the local development server. |
| `npm start` | Starts the same Create React App development server. |
| `npm run build` | Produces an optimized production build in `build/`. |
| `npm test` | Starts the test runner in watch mode. |

## Data and privacy

Atlas currently has no backend or user account. Trips, expenses, and map selections are kept in the current browser’s local storage. Clearing the browser’s site data removes this information.

## Project structure

```text
src/
├── components/   # Screens, cards, forms, map, and UI elements
├── images/       # Atlas assets and fallback imagery
├── services/     # Local-storage persistence helpers
└── App.js        # Application routes
```

## Notes for contributors

- Keep displayed dates in `DD/MM/AAAA`; data is stored internally as `AAAA-MM-DD` so calculations stay reliable.
- Do not commit `.env` or Mapbox tokens.
- Check the responsive form and trip-card layouts at narrow widths when changing UI styles.
