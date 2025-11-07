# CardioSense Frontend

Modern Next.js application for CardioSense - A cardiovascular risk assessment platform powered by AI.

## Features

- **Risk Assessment**: Multi-step form for NHANES-aligned health data collection
- **Risk Dashboard**: Interactive visualization of cardiometabolic risk scores
- **AI Coach**: RAG-powered chatbot for personalized health recommendations
- **Action Plans**: 2-week personalized wellness plans with progress tracking
- **History Tracking**: Trend analysis and historical assessment viewing
- **Shareable Results**: Generate secure links to share assessment results

## Tech Stack

- **Framework**: Next.js 15.4 (App Router, Edge Runtime)
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Building

```bash
npm run build
npm run start
```

## Project Structure

```
front/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/             # Protected app routes
│   │   │   ├── app/           # Dashboard
│   │   │   ├── assess/        # Risk assessment form
│   │   │   ├── results/       # Assessment results
│   │   │   ├── coach/         # AI chatbot
│   │   │   ├── plan/          # Action plan tracker
│   │   │   └── history/       # Assessment history
│   │   ├── (public)/          # Public routes
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration
│   │   ├── shared/            # Shared results (public)
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── DisclaimerBanner.tsx
│   │   ├── RiskGauge.tsx
│   │   ├── ShareButton.tsx
│   │   └── LoadingSpinner.tsx
│   ├── lib/                   # Utilities and helpers
│   │   ├── api/               # API client
│   │   ├── types/             # TypeScript types
│   │   ├── validators/        # Zod schemas
│   │   ├── utils/             # Helper functions
│   │   ├── supabase/          # Supabase client
│   │   └── actions/           # Server actions
│   └── middleware.ts          # Auth middleware
├── __tests__/                 # Unit tests
├── e2e/                       # E2E tests
├── public/                    # Static assets
└── package.json
```

## Testing

### Unit Tests

```bash
npm run test              # Run tests
npm run test:ui           # Run with UI
npm run test:coverage     # Generate coverage report
```

### E2E Tests

```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run with Playwright UI
```

### Lint

```bash
npm run lint              # Check for errors
npm run lint:fix          # Auto-fix errors
```

### Run All Tests

```bash
npm run test:all          # Lint + Unit tests with coverage
```

## Key Features Implementation

### Multi-Step Assessment Form

Located at `/app/assess`, implements a 3-step wizard:
1. Anthropometry (height, weight, waist)
2. Lifestyle (sleep, smoking, activity)
3. Diet (fruit/vegetable intake)

- Real-time validation with Zod
- Auto-save to localStorage
- Progress indicator
- Calls `/api/health/predict` endpoint

### Risk Dashboard

Located at `/app/results/[id]`:
- Animated risk gauge (0-100 scale)
- Color-coded risk levels (green/yellow/red)
- Top 5 risk drivers with bar charts
- BMI calculation and categorization
- Share functionality
- Doctor referral for high risk

### AI Coach

Located at `/coach`:
- Real-time chat interface
- Context-aware responses (uses assessment data)
- RAG citations from knowledge base
- Session persistence to Supabase
- Export conversation functionality

### Action Plan Tracker

Located at `/app/plan`:
- Display 2-week personalized plans
- Daily goal tracking with checkboxes
- Progress visualization
- Categories: Nutrition, Exercise, Sleep, Lifestyle
- Real-time updates to Supabase

### Shareable Results

- Generate unique tokens for assessments
- Public viewing at `/shared/[token]`
- No authentication required
- Read-only view
- CTA to register

## API Integration

The frontend integrates with the FastAPI backend:

### Endpoints

- `POST /api/health/predict` - Calculate risk score
- `POST /api/health/coach` - Get AI recommendations
- `POST /api/health/generate-pdf` - Export plan as PDF

### Error Handling

All API calls include:
- Automatic retry logic
- User-friendly error messages
- Loading states
- Network error detection

## Database Schema (Supabase)

### Tables

- `assessments` - Risk assessment results
- `action_plans` - 2-week wellness plans  
- `plan_goals` - Individual goals within plans
- `chat_sessions` - Coach conversations
- `chat_messages` - Individual chat messages

All tables have Row Level Security (RLS) enabled.

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader friendly

## Performance

- Edge runtime for fast responses
- Image optimization with Next.js
- Code splitting and lazy loading
- Optimized bundle size
- Lighthouse score target: 90+

## Deployment

### Cloudflare Pages

```bash
npm run pages:build
npm run deploy
```

### Environment Variables

Set in Cloudflare Pages dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Medical Disclaimer

CardioSense is an educational tool based on NHANES data. It does not provide medical diagnosis or replace professional healthcare advice. Prominent disclaimers are displayed throughout the application.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

