# 🐦 Bird Photo Gallery

A modern, full-stack web application for managing and organizing bird photography with AI-powered species detection integration via Haikubox.

## Features

### Core Functionality
- 📸 **Photo Management**: Upload, organize, and tag bird photos with species information
- 🔍 **Smart Species Assignment**: Automatic species suggestions from Haikubox detections
- ⭐ **Favorites & Collections**: Mark favorite photos and organize by species
- 🗓️ **Timeline View**: Browse photos chronologically with EXIF date support
- 📊 **Statistics Dashboard**: Track species diversity, photo counts, and activity
- 🔊 **Haikubox Integration**: Sync detections from your Haikubox device

### Advanced Features
- 🎯 **Rarity Tracking**: Classify species by rarity (common, uncommon, rare)
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🖼️ **Automatic Thumbnails**: Generate optimized thumbnails for fast loading
- 📝 **Photo Notes**: Add custom notes and observations to each photo
- 🔎 **Wikipedia Integration**: Fetch species information automatically
- 🗂️ **Activity Timeline**: See when each species was photographed over time
- 🔐 **API Key Authentication**: Secure API endpoints with key-based auth

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript 5 (strict mode)

### Backend
- **Runtime**: Node.js via Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Supabase for photo storage
- **Validation**: Zod for schema validation
- **Image Processing**: Sharp + exifr

### Development & Testing
- **Testing**: Jest + React Testing Library (57 tests)
- **Linting**: ESLint 9 with Next.js config
- **Type Checking**: TypeScript with strict mode
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database
- Supabase account (for photo storage)
- Haikubox device (optional, for automatic detections)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bird-photo-gallery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in your values:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Supabase anonymous key
   - `HAIKUBOX_SERIAL`: Your Haikubox serial number (optional)
   - `API_KEY`: Create a secure key for API authentication

4. **Set up the database**
   ```bash
   # Push schema to database
   npm run db:push

   # Or run migrations
   npm run db:migrate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Testing
```bash
npm test                # Run all tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Database
```bash
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
```

## Project Structure

```
bird-photo-gallery/
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── api/              # API routes
│   │   │   ├── photos/       # Photo CRUD operations
│   │   │   ├── species/      # Species management
│   │   │   ├── upload/       # Photo upload endpoints
│   │   │   ├── haikubox/     # Haikubox sync endpoints
│   │   │   └── activity/     # Activity timeline endpoints
│   │   ├── favorites/        # Favorites page
│   │   ├── inbox/            # Unassigned photos page
│   │   ├── species/          # Species list and detail pages
│   │   ├── page.tsx          # Home page (photo gallery)
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── activity/         # Activity timeline components
│   │   ├── gallery/          # Photo gallery components
│   │   ├── layout/           # Header and navigation
│   │   ├── species/          # Species management components
│   │   ├── stats/            # Statistics widgets
│   │   ├── ui/               # Reusable UI components
│   │   └── upload/           # Upload modal
│   ├── db/                   # Database configuration
│   │   ├── schema.ts         # Drizzle ORM schema
│   │   └── index.ts          # Database connection
│   ├── lib/                  # Utility libraries
│   │   ├── validation.ts     # Zod schemas (✅ tested)
│   │   ├── image.ts          # Image processing (✅ tested)
│   │   ├── auth.ts           # API authentication
│   │   ├── supabase.ts       # Supabase client
│   │   ├── wikipedia.ts      # Wikipedia API integration
│   │   ├── activity.ts       # Activity tracking
│   │   └── __tests__/        # Unit tests
│   ├── types/                # TypeScript type definitions
│   └── config/               # App configuration
├── public/                   # Static assets
├── TESTING.md                # Testing documentation
├── BUGS.md                   # Known bugs and fixes
├── .env.example              # Environment variables template
└── package.json              # Dependencies and scripts
```

## API Documentation

### Authentication

All API endpoints require an `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/photos
```

### Key Endpoints

#### Photos
- `GET /api/photos` - List photos with filtering and pagination
- `GET /api/photos/:id` - Get single photo details
- `PATCH /api/photos/:id` - Update photo (assign species, notes, favorite)
- `DELETE /api/photos/:id` - Delete photo
- `POST /api/upload/browser` - Upload photo from browser

#### Species
- `GET /api/species` - List all species
- `GET /api/species/:id` - Get species details with photos
- `POST /api/species` - Create new species
- `PATCH /api/species/:id` - Update species
- `DELETE /api/species/:id` - Delete species

#### Haikubox Integration
- `POST /api/haikubox/sync` - Sync detections from Haikubox
- `GET /api/haikubox/detections` - List cached detections
- `GET /api/haikubox/stats` - Get detection statistics

#### Activity
- `GET /api/activity/heatmap` - Get species activity heatmap
- `GET /api/activity/current` - Get current day activity
- `GET /api/activity/species/:name` - Get timeline for species

#### Utilities
- `GET /api/health` - Health check endpoint
- `GET /api/birds/lookup?name=robin` - Look up bird on Wikipedia

## Testing

This project has comprehensive test coverage for critical functionality. See [TESTING.md](TESTING.md) for details.

**Current Coverage**: 57 tests covering validation schemas and image processing

```bash
# Run tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### What's Tested
- ✅ All Zod validation schemas (56 tests)
- ✅ Image processing pipeline (13 tests)
- ✅ EXIF data extraction
- ✅ Error handling and edge cases

### Testing Roadmap
See [TESTING.md](TESTING.md) for detailed testing guide and expansion priorities.

## Database Schema

### Main Tables

**species**
- Stores bird species information
- Fields: `commonName`, `scientificName`, `description`, `rarity`, `coverPhotoId`

**photos**
- Stores photo metadata and relationships
- Fields: `filename`, `thumbnailFilename`, `speciesId`, `originalDateTaken`, `isFavorite`, `notes`

**haikuboxDetections**
- Cached detections from Haikubox
- Fields: `detectionId`, `speciesCommonName`, `scientificName`, `confidence`, `timestamp`

**activityLog**
- Tracks when species are photographed
- Fields: `speciesId`, `photoId`, `activityDate`, `activityType`

## Deployment

### Railway (Recommended)

1. **Connect your GitHub repository**
   - Link repository to Railway project

2. **Set environment variables** in Railway dashboard
   - `DATABASE_URL` (provided by Railway PostgreSQL)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `HAIKUBOX_SERIAL`
   - `API_KEY`

3. **Deploy**
   - Railway automatically builds and deploys on push

### Vercel

1. **Import project** from GitHub
2. **Add environment variables** in Vercel dashboard
3. **Configure external PostgreSQL** (Railway, Supabase, Neon, etc.)
4. **Deploy**

### Docker (Alternative)

```dockerfile
# Dockerfile included in repository
docker build -t bird-gallery .
docker run -p 3000:3000 --env-file .env.local bird-gallery
```

## Configuration

### Environment Variables

See [.env.example](.env.example) for all available configuration options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `API_KEY` - Secure key for API authentication

**Optional:**
- `HAIKUBOX_SERIAL` - Haikubox device serial (for auto-sync)
- `SENTRY_DSN` - Sentry DSN for error tracking

### Security Settings

The app includes built-in security features:
- API key authentication on all endpoints
- Rate limiting (in-memory, 100 req/15min per IP)
- Security headers (HSTS, X-Frame-Options, Permissions-Policy)
- Input validation on all API routes

## Development Workflow

### Adding a New Feature

1. **Plan the implementation** (use [EnterPlanMode](TESTING.md) if complex)
2. **Create database schema changes** in `src/db/schema.ts`
3. **Add validation schemas** in `src/lib/validation.ts`
4. **Write tests** for validation and business logic
5. **Implement API routes** in `src/app/api/`
6. **Create UI components** in `src/components/`
7. **Add pages** in `src/app/`
8. **Run tests** and fix any issues
9. **Test manually** in browser
10. **Commit and push**

### Code Quality Checklist

Before committing:
- [ ] Run `npm run lint` - No ESLint errors
- [ ] Run `npm run type-check` - No TypeScript errors
- [ ] Run `npm test` - All tests passing
- [ ] Test manually in browser
- [ ] Add tests for new validation schemas
- [ ] Update documentation if needed

## Known Issues

See [BUGS.md](BUGS.md) for tracked issues and fixes.

## Recent Updates (2026-01-22)

### Testing Infrastructure Added ✨

- Set up Jest + React Testing Library
- Added 57 comprehensive tests for validation schemas and image processing
- Created [TESTING.md](TESTING.md) documentation
- Configured test scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`
- Added test coverage reporting

**Test Coverage:**
- ✅ All Zod validation schemas (Species, Photos, Pagination, Queries)
- ✅ Image processing pipeline (Sharp, EXIF, uploads)
- ✅ Error handling and edge cases

See commit history for detailed changes.

## Performance Considerations

### Known Optimizations Needed

1. **N+1 Query in Species List** - The species endpoint makes 2N+1 queries for cover photos
2. **Database Indexes** - Missing indexes on `photos.speciesId` and other common queries
3. **Rate Limiting** - In-memory implementation won't scale to multiple instances

See the codebase review documentation for detailed optimization recommendations.

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure all tests pass (`npm test`)
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Coding Standards

- Use TypeScript strict mode
- Follow ESLint rules
- Write tests for new validation schemas and business logic
- Add JSDoc comments for complex functions
- Keep components under 500 lines (split if larger)

## License

This project is private and proprietary.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ and ☕
