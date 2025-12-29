# DealCard

A family financial education platform that helps parents teach kids about money management through chores, allowances, and rewards. Built with Next.js, Supabase, Prisma, and Claude AI.

## Features

- **Parent Dashboard**: Manage kids' profiles, track balances, create chores, and approve transactions
- **Kid Mode**: PIN-protected interface for kids to view their balance, complete chores, and redeem rewards
- **Transaction System**: Track chores, allowances, purchases, bonuses, and penalties
- **Rewards Catalog**: Create and manage rewards that kids can earn
- **AI Financial Education**: Claude-powered explanations tailored to each child's age
- **Supabase Authentication**: Secure OAuth and email/password login
- **File Storage**: Upload avatars and receipt images to Supabase Storage

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: Prisma + PostgreSQL
- **Authentication**: Supabase Auth (@supabase/ssr)
- **AI**: Anthropic Claude (@anthropic-ai/sdk)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Validation**: Zod
- **Storage**: Supabase Storage
- **Background Jobs**: Upstash QStash (optional)
- **Icons**: Lucide React

## Quick Links

- 📖 [Full Documentation](#getting-started) (below)
- 🚀 [Deploy to Vercel](DEPLOYMENT_VERCEL.md) - Step-by-step deployment guide
- ✅ [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Track your deployment progress
- ⚡ [Quick Setup Guide](SETUP.md) - Get running locally in 5 minutes
- 🏗️ [Architecture Guide](ARCHITECTURE.md) - Technical deep dive
- 📡 [API Documentation](API.md) - Complete API reference

## Getting Started

### Prerequisites

- Node.js 20+ or higher
- npm, yarn, pnpm, or bun
- PostgreSQL database
- Supabase account (for auth & storage)
- Anthropic API key (for Claude AI features)

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database - Use Supabase PostgreSQL or any PostgreSQL database
DATABASE_URL="postgresql://user:password@localhost:5432/dealcard?schema=public"

# Supabase - Get from https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."

# Anthropic - Get from https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Optional - Upstash QStash for background jobs
QSTASH_URL="https://qstash.upstash.io"
QSTASH_TOKEN="..."
```

3. **Set up Supabase:**

Create a new project at [supabase.com](https://supabase.com), then:

- Enable Email authentication in Settings > Authentication
- (Optional) Enable Google OAuth provider
- Create storage buckets: `avatars` and `receipts` in Storage settings
- Set both buckets to **Public** for easy access (or use signed URLs)

4. **Initialize the database:**

```bash
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database
```

5. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
dealcard/
├── app/
│   ├── (auth)/                  # Auth route group
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── (parent)/               # Parent route group
│   │   └── dashboard/          # Parent dashboard
│   ├── (kid)/                  # Kid route group
│   │   └── kid-mode/           # PIN-protected kid interface
│   ├── api/                    # API routes
│   │   ├── kids/               # Kid management
│   │   ├── kid-session/        # Kid PIN session
│   │   ├── transactions/       # Transaction CRUD
│   │   ├── chat/               # Claude AI chat
│   │   └── rewards/            # Rewards management
│   ├── auth/callback/          # OAuth callback handler
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   └── proxy.ts            # Middleware session handler
│   ├── auth/
│   │   └── kid-session.ts      # Kid PIN-based sessions
│   ├── ai/
│   │   └── claude.ts           # Claude AI helpers
│   └── storage/
│       └── supabase-storage.ts # File upload utilities
├── prisma/
│   └── schema.prisma           # Database schema
└── middleware.ts               # Auth middleware
```

## Key Features Explained

### Authentication

- **Parents**: Use Supabase Auth (email/password or OAuth)
- **Kids**: Use PIN-based sessions (no email required)
- Middleware protects parent routes, redirects unauthenticated users to login

### Database Schema

The Prisma schema includes:

- **User**: Parent accounts (linked to Supabase Auth)
- **Kid**: Kid profiles with PIN, balance, and avatar
- **Transaction**: Chores, allowances, purchases, bonuses, penalties
- **Reward**: Rewards catalog that kids can redeem
- **RewardClaim**: Tracks reward redemptions
- **ChatMessage**: Stores Claude AI conversation history

### API Routes

- `GET/POST /api/kids` - List/create kids
- `GET/POST/DELETE /api/kid-session` - Kid PIN authentication
- `GET/POST /api/transactions` - Transaction management
- `POST /api/chat` - Chat with Claude AI

### Kid Mode Flow

1. Kid selects their profile from list
2. Enters 4-digit PIN
3. Gains access to their dashboard for 1 hour
4. Can view balance, chores, and rewards
5. Session automatically expires or can be manually ended

### Claude AI Integration

The app uses Claude for:
- Age-appropriate financial education
- Chore compensation suggestions
- Savings goal encouragement messages
- General financial Q&A

## Development Commands

```bash
# Development
npm run dev                    # Start dev server

# Build
npm run build                  # Build for production
npm start                      # Start production server

# Database
npm run db:generate            # Generate Prisma Client
npm run db:push                # Push schema to DB (no migrations)
npm run db:migrate             # Create and apply migrations
npm run db:studio              # Open Prisma Studio GUI

# Code quality
npm run lint                   # Run ESLint
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key |
| `QSTASH_URL` | No | Upstash QStash URL |
| `QSTASH_TOKEN` | No | Upstash QStash token |
| `NEXT_PUBLIC_APP_URL` | No | App URL (for OAuth redirects) |

## Security Notes

### Kid PIN Authentication

The current implementation uses a **simple PIN storage approach** for demonstration purposes. For production:

1. Use `bcrypt` or `argon2` to hash PINs before storing
2. Implement rate limiting on PIN attempts
3. Add PIN reset functionality for parents
4. Consider adding biometric options for devices that support it

Example with bcrypt:

```typescript
import bcrypt from 'bcryptjs'

// Hash PIN when creating/updating
const hashedPin = await bcrypt.hash(pin, 10)

// Verify PIN
const isValid = await bcrypt.compare(inputPin, storedHash)
```

### General Security

- Keep environment variables secret
- Use HTTPS in production
- Enable Supabase Row Level Security (RLS)
- Validate all user inputs with Zod
- Sanitize data before rendering

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel settings
4. Deploy

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to:
- Set all environment variables
- Ensure PostgreSQL database is accessible
- Configure OAuth redirect URLs in Supabase

## Troubleshooting

### "Prisma Client not generated"

```bash
npm run db:generate
```

### "Invalid JWT" or auth errors

- Check your Supabase URL and anon key
- Ensure middleware is properly configured
- Clear cookies and try again

### Database connection issues

- Verify DATABASE_URL is correct
- Check if database is accessible from your IP
- For Supabase, ensure "Pooler" connection string is used

## Next Steps & Ideas

- [ ] Add recurring allowance scheduler (weekly/monthly)
- [ ] Implement savings goals with progress tracking
- [ ] Add parent-kid chat/messaging
- [ ] Create spending analytics and reports
- [ ] Build mobile app with React Native
- [ ] Add gamification (badges, levels, streaks)
- [ ] Integrate real payment rails (Stripe, Square)
- [ ] Add chore photo proof requirements
- [ ] Create educational mini-games about money

## Learn More

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Prisma Docs](https://www.prisma.io/docs)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or reach out to the development team.
