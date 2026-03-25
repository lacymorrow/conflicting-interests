# Conflicting Interests

A platform for tracking and exposing conflicts of interest in U.S. politics.

## Current Features

### Data Collection
✅ Congress.gov API integration for member and bill data
✅ Automatic data updates via scraping scripts
✅ PostgreSQL database with Prisma ORM
❌ FEC campaign finance data integration (planned)
❌ OpenSecrets financial disclosure integration (planned)

### Web Application
✅ Next.js framework with TypeScript
✅ Modern UI components with shadcn/ui
✅ Basic politician search
❌ Financial visualization dashboard (in progress)
❌ Bill tracking interface (in progress)
❌ Action center for user engagement (planned)
❌ Learning center for educational content (planned)

### API and Backend
✅ Database schema and models
✅ Basic API routes
❌ Full CRUD operations for all models (in progress)
❌ Authentication system (planned)
❌ Admin dashboard (planned)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/conflicting-interests.git
cd conflicting-interests
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_postgres_database_url
CONGRESS_API_KEY=your_congress_api_key
NEXT_PUBLIC_FEC_API_KEY=your_fec_api_key
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

## Development

Start the development server:
```bash
npm run dev
```

## Data Collection

### Scrape Congress Data
Fetch current Congress members and bills:
```bash
npx tsx scripts/scrape-congress.ts
```

## Database Management

### Reset Database
Reset the database and reapply all migrations:
```bash
npx prisma migrate reset --force
```

### View Database
Open Prisma Studio to view and edit data:
```bash
npx prisma studio
```

## API Documentation

The application uses the Congress.gov API to fetch legislative data. You'll need an API key from [Congress.gov](https://api.congress.gov/) to access their services.

### Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `CONGRESS_API_KEY`: API key for Congress.gov API
- `NEXT_PUBLIC_FEC_API_KEY`: API key for FEC API

## Project Structure

```
src/
├── app/             # Next.js app directory
├── components/      # Reusable UI components
├── lib/            # Utility functions and API integrations
│   └── api/        # API client implementations
├── config/         # Configuration files
├── types/          # TypeScript type definitions
└── styles/         # Global styles and Tailwind config
```

## Data Sources

The platform integrates with multiple data sources to provide comprehensive insights:

1. **ProPublica Congress API**
   - Voting records
   - Bill information
   - Member details

2. **OpenSecrets API**
   - Campaign finance data
   - Industry contributions
   - PAC information

3. **Federal Election Commission (FEC) API**
   - Committee contributions
   - Independent expenditures
   - Candidate information

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license here]
