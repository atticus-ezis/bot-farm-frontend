# Frontend - Bot Analytics Dashboard

A Next.js-based frontend application for visualizing bot submission analytics and managing honeypot data.

## Tech Stack

- **Next.js 14** (Pages Router)
- **React 18**
- **Tailwind CSS** - Utility-first CSS framework
- **Flowbite React** - UI component library built on Tailwind

## Project Structure

```
frontend/
├── components/          # Reusable React components
│   ├── ListResults.jsx      # ⭐ Main reusable data table component
│   ├── DetailComponent.jsx  # Factory for detail view modals
│   └── Navbar.jsx           # Navigation component
├── pages/              # Next.js pages (routing)
│   ├── _app.jsx        # App wrapper with global styles & Navbar
│   ├── index.jsx       # Dashboard with summary & preview tables
│   ├── bot-event-list.jsx  # Full bot events list with filters
│   ├── ip-list.jsx     # IP address analytics
│   ├── path-list.jsx   # Request path analytics
│   └── attack-list.jsx # Attack type analytics
├── config/             # Configuration files
│   ├── api.js          # API endpoint URLs
│   └── filters.js      # Reusable filter definitions
├── utils/              # Utility functions
│   └── helper.js       # Helper functions (e.g., pagination)
├── styles/             # Global CSS
│   └── globals.css
├── public/             # Static assets
├── FRONTEND_USER_JOURNEY.md    # User navigation guide
├── FRONTEND_TECHNICAL_SPECS.md # API documentation
└── package.json
```

## Core Component: ListResults

**`ListResults`** is the central reusable component that powers all data tables throughout the application. It provides a consistent, feature-rich interface for displaying paginated, filterable, and searchable data from the Django REST API.

### Key Features

- **Pagination** - Server-side pagination with page navigation
- **Search** - Full-text search across API endpoints
- **Filtering** - Configurable dropdown filters (e.g., attack categories, HTTP methods)
- **Sorting** - Customizable ordering options
- **Detail Views** - Click rows to view detailed information in a modal
- **Custom Rendering** - Support for custom cell renderers and accessors
- **URL Integration** - Reads and respects URL query parameters for deep linking
- **Responsive Design** - Mobile-friendly table layout
- **Loading States** - Built-in loading and error handling
- **Compact Mode** - Optional compact display for embedded tables

### Usage Example

```jsx
import ListResults from "@/components/ListResults";
import { BOT_EVENTS_URL } from "@/config/api";
import { attackCategoryFilter, methodFilter } from "@/config/filters";

const columns = [
  { label: "Timestamp", key: "created_at", type: "date" },
  { label: "IP Address", key: "ip_address" },
  { label: "Attack Categories", key: "attack_categories" },
];

const orderingOptions = [
  { value: "-created_at", label: "Newest First" },
  { value: "created_at", label: "Oldest First" },
];

<ListResults
  baseUrl={BOT_EVENTS_URL}
  columns={columns}
  orderingOptions={orderingOptions}
  filters={[attackCategoryFilter, methodFilter]}
  title="Bot Events"
  defaultOrdering="-created_at"
  detailFields={detailComponentInfo}
  customCellRenderers={{
    attack_categories: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.attack_categories.map((cat) => (
          <Badge key={cat}>{cat}</Badge>
        ))}
      </div>
    ),
  }}
/>;
```

### ListResults Props

| Prop                   | Type     | Description                                                          |
| ---------------------- | -------- | -------------------------------------------------------------------- |
| `baseUrl`              | string   | API endpoint URL (required)                                          |
| `columns`              | array    | Column definitions with `label`, `key`, `type`, `render`, `accessor` |
| `orderingOptions`      | array    | Sort options: `{value: string, label: string}`                       |
| `filters`              | array    | Filter definitions from `config/filters.js`                          |
| `title`                | string   | Page title                                                           |
| `defaultOrdering`      | string   | Default sort field (e.g., `"-created_at"`)                           |
| `detailFields`         | array    | Field config for detail modal (uses `DetailComponent`)               |
| `customCellRenderers`  | object   | Custom render functions by column key                                |
| `customHandleRowClick` | function | Override default row click behavior                                  |
| `additionalParams`     | object   | Extra query params (e.g., `{page_size: 25}`)                         |
| `hideSearch`           | boolean  | Hide search input                                                    |
| `hidePagination`       | boolean  | Hide pagination controls                                             |
| `hideHeader`           | boolean  | Hide page header                                                     |
| `compact`              | boolean  | Compact table mode                                                   |
| `useDetailView`        | boolean  | Enable/disable detail modal                                          |

## Pages

### `/` - Dashboard

- Displays summary analytics (total events, attacks, unique IPs)
- Preview tables for recent bot events, high-risk paths, and high-risk IPs
- Uses `ListResults` in compact mode for embedded previews
- Click-through navigation to full list pages

### `/bot-event-list` - Bot Events

- Complete list of all bot events with full filtering capabilities
- Filters: Attack Category, HTTP Method, Attack Attempted, Bot Activity Type
- Sorting by timestamp, IP address, location, attack count
- Detail modal shows full event information
- Supports URL parameters for filtering from other pages (e.g., `?ip_address=1.2.3.4`)

### `/ip-list` - IP Address Analytics

- Aggregated IP address statistics
- Shows location, language, referer, email, traffic counts
- Clickable IP addresses navigate to filtered bot events
- No detail view (uses `useDetailView={false}`)

### `/path-list` - Request Path Analytics

- Aggregated statistics by request path
- Shows traffic counts, attack counts, spam/scan counts
- Clickable paths navigate to filtered bot events
- Displays most popular attacks per path

### `/attack-list` - Attack Types

- List of attack types and their statistics
- Shows attack category information

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see main README)

### Installation

```bash
cd frontend
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file (or set environment variables):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

- `NEXT_PUBLIC_API_BASE_URL` - Base URL for the Django backend API
  - Development: `http://localhost:8000/api`
  - Docker: `http://backend:8000/api`

## API Integration

The frontend communicates with the Django REST API. All API endpoints are configured in `config/api.js`:

```javascript
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const SNAPSHOT_URL = `${BASE_URL}/snapshot/`;
export const AGGREGATE_PATHS_URL = `${BASE_URL}/aggregate-paths/`;
export const AGGREGATE_IPS_URL = `${BASE_URL}/aggregate-ips/`;
export const BOT_EVENTS_URL = `${BASE_URL}/bot-events/`;
export const ATTACK_TYPES_URL = `${BASE_URL}/attacks/`;
```

See:

- **[FRONTEND_TECHNICAL_SPECS.md](./FRONTEND_TECHNICAL_SPECS.md)** - Complete API endpoint documentation
- **[FRONTEND_USER_JOURNEY.md](./FRONTEND_USER_JOURNEY.md)** - User navigation patterns and view relationships

### Key Endpoints Used

- `GET /api/snapshot/` - Homepage summary analytics (total events, attacks, IPs, top paths/categories)
- `GET /api/bot-events/` - Bot event list with filtering, search, and pagination
- `GET /api/bot-events/{id}/` - Individual bot event detail
- `GET /api/aggregate-ips/` - IP address analytics with search and filtering
- `GET /api/aggregate-paths/` - Request path analytics
- `GET /api/attacks/` - Attack type records

## Features

### Search & Filtering

All search and filtering is handled by the `ListResults` component:

- **Unified Search**: Full-text search across relevant fields (varies by endpoint)
- **Multiple Filters**: Configurable dropdown filters (attack categories, HTTP methods, etc.)
- **URL Parameters**: Filters and search persist in URL for sharing and bookmarking
- **Sorting**: Customizable ordering options per page
- **Combined Filters**: Multiple filters can be combined (e.g., `?attack_categories=XSS&method=POST`)

### Navigation

The frontend supports rich navigation between views:

- Click IP addresses in IP list → Filtered bot events for that IP
- Click request paths in path list → Filtered bot events for that path
- Click bot event rows → Detail modal with full event information
- Navigation bar provides quick access to all major views

See [FRONTEND_USER_JOURNEY.md](./FRONTEND_USER_JOURNEY.md) for complete navigation patterns.

## Docker

The frontend is containerized for production deployment:

```bash
docker build -t bot-analytics-frontend .
```

Or use `docker-compose` from the project root (see main README).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Styling

- **Tailwind CSS** - Utility classes for styling
- **Flowbite** - Pre-built components (tables, modals, buttons)
- Global styles in `styles/globals.css`

## Components

### `ListResults` ⭐

The main reusable component for all data tables. See the [ListResults section](#core-component-listresults) above for complete documentation.

**Key capabilities:**

- Server-side pagination, search, filtering, and sorting
- Configurable columns with custom renderers
- Detail modal integration via `DetailComponent`
- URL parameter support for deep linking
- Responsive design with compact mode option

### `DetailComponent`

Factory function that creates detail view components for modals. Used by `ListResults` to display detailed information when rows are clicked.

**Features:**

- Configurable field display (labels, types, formatting)
- Support for date, JSON, array, and boolean field types
- Automatic handling of complex data structures
- Badge rendering for arrays and categories

**Usage:**

```jsx
const detailComponentInfo = [
  { value: "created_at", label: "Timestamp", type: "date" },
  { value: "ip_address", label: "IP Address" },
  { value: "data_details", label: "Data Present", type: "json" },
];

<ListResults
  detailFields={detailComponentInfo}
  // ... other props
/>;
```

### `Navbar`

Navigation component displayed on all pages via `_app.jsx`. Provides links to:

- Dashboard (`/`)
- Bot Events (`/bot-event-list`)
- IP Addresses (`/ip-list`)
- Paths (`/path-list`)
- Attacks (`/attack-list`)

## Configuration

### Filter Definitions (`config/filters.js`)

Reusable filter configurations that can be imported and used with `ListResults`:

- `attackCategoryFilter` - Filter by attack type (XSS, SQLI, LFI, etc.)
- `methodFilter` - Filter by HTTP method (GET, POST, PUT, etc.)
- `attackAttemptedFilter` - Filter by attack presence (Yes/No)
- `botEventTypeFilter` - Filter by activity type (attack, spam, scan)

Example:

```jsx
import { attackCategoryFilter, methodFilter } from "@/config/filters";

<ListResults
  filters={[attackCategoryFilter, methodFilter]}
  // ... other props
/>;
```

## Development Notes

- Uses Next.js Pages Router (not App Router)
- No TypeScript (JavaScript/JSX only)
- API calls use `fetch()` with error handling
- All data tables use the shared `ListResults` component for consistency
- Filter definitions are centralized in `config/filters.js` for reusability
- CORS handled by backend

## Troubleshooting

**API Connection Issues:**

- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly in `.env.local` (must be in `frontend/` root, not subdirectories)
- Ensure backend is running and accessible
- Check CORS settings in backend
- Check browser console for API errors

**Environment Variables:**

- `.env.local` must be in the `frontend/` root directory (same level as `package.json`)
- Restart the dev server after changing environment variables
- Format: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api` (no quotes, no spaces around `=`)

**Build Errors:**

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**ListResults Issues:**

- Ensure `baseUrl` prop points to a valid API endpoint
- Check that `columns` array matches the API response structure
- Verify filter keys match API query parameter names
- Check browser console for fetch errors

## Related Documentation

- [Main README](../README.md) - Project overview and setup
- [FRONTEND_TECHNICAL_SPECS.md](./FRONTEND_TECHNICAL_SPECS.md) - Complete API reference
- [FRONTEND_USER_JOURNEY.md](./FRONTEND_USER_JOURNEY.md) - User navigation guide
