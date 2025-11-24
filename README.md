# Frontend - Bot Analytics Dashboard

A Next.js-based frontend application for visualizing bot submission analytics and managing honeypot data.

## Tech Stack

- **Next.js 14** (Pages Router)
- **React 18**
- **Tailwind CSS** - Utility-first CSS framework
- **Flowbite React** - UI component library built on Tailwind
- **JavaScript/JSX** - No TypeScript

## Project Structure

```
frontend/
├── components/          # Reusable React components
│   ├── DashboardTable.jsx
│   └── SubmissionModal.jsx
├── pages/              # Next.js pages (routing)
│   ├── _app.jsx        # App wrapper with global styles
│   ├── index.jsx       # Public dashboard (landing page)
│   ├── admin.jsx       # Admin console with filters
│   └── contact.jsx     # Honeypot contact form
├── styles/             # Global CSS
│   └── globals.css
├── public/             # Static assets
├── FRONTEND_USER_JOURNEY.md    # User navigation guide
├── FRONTEND_TECHNICAL_SPECS.md # API documentation
└── package.json
```

## Pages

### `/` - Public Dashboard
- Displays summary analytics and live bot event feed
- Shows aggregated statistics (total events, attacks, IPs)
- Real-time table of recent bot activity

### `/admin` - Admin Console
- Authenticated view (Basic Auth)
- Advanced filtering and search capabilities
- CSV export functionality
- Modal drill-down for detailed submission inspection

### `/contact` - Honeypot Form
- Public contact form with hidden honeypot fields
- Accepts bot submissions and forwards to backend API
- Includes hidden fields to detect automated submissions

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

The frontend communicates with the Django REST API. See:

- **[FRONTEND_TECHNICAL_SPECS.md](./FRONTEND_TECHNICAL_SPECS.md)** - Complete API endpoint documentation
- **[FRONTEND_USER_JOURNEY.md](./FRONTEND_USER_JOURNEY.md)** - User navigation patterns and view relationships

### Key Endpoints Used

- `GET /api/snapshot/` - Homepage summary analytics
- `GET /api/aggregate-paths/` - Path analytics
- `GET /api/aggregate-ips/` - IP analytics with search and filtering
- `GET /api/bot-events/` - Bot event list
- `GET /api/attacks/` - Attack records
- `POST /api/contact-bot/` - Submit honeypot form data

## Features

### Search & Filtering

- **IP Analytics**: Unified search across `ip_address`, `referer`, and `email` fields
- **Sorting**: Order by `email_count`, `traffic_count`, `created_at`, etc.
- **Multiple Filters**: Combine filters with `&` (e.g., `?ip_address=192.168.1.1&category=XSS`)

### Navigation

The frontend supports rich navigation between views:
- Click IP addresses → IP Analytics Detail
- Click attack categories → Filtered Attack List
- Click request paths → Filtered Bot Event List
- Click bot event IDs → Bot Event Detail

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

### `DashboardTable`
Reusable table component for displaying bot events with:
- Pagination
- Sorting
- Row click handlers
- Responsive design

### `SubmissionModal`
Modal component for viewing detailed submission data:
- Safe HTML rendering (escaped)
- Metadata display
- Attack details

## Development Notes

- Uses Next.js Pages Router (not App Router)
- No TypeScript (JavaScript/JSX only)
- API calls use `fetch()` with error handling
- Basic Auth for admin endpoints
- CORS handled by backend

## Troubleshooting

**API Connection Issues:**
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Ensure backend is running and accessible
- Check CORS settings in backend

**Build Errors:**
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Related Documentation

- [Main README](../README.md) - Project overview and setup
- [FRONTEND_TECHNICAL_SPECS.md](./FRONTEND_TECHNICAL_SPECS.md) - Complete API reference
- [FRONTEND_USER_JOURNEY.md](./FRONTEND_USER_JOURNEY.md) - User navigation guide

