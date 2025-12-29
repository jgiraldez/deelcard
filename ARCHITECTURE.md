# DealCard Architecture

## Tech Stack Summary

- **Frontend**: Next.js 16 App Router + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Authentication**: Supabase Auth (OAuth + Email/Password)
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: Supabase Storage (avatars, receipts)
- **AI**: Anthropic Claude 3.5 Sonnet
- **Validation**: Zod schemas
- **Background Jobs**: Upstash QStash (optional)

## Architecture Patterns

### Route Groups

The app uses Next.js route groups for logical organization:

```
app/
├── (auth)/          # Public authentication pages
├── (parent)/        # Parent-protected routes
├── (kid)/           # Kid PIN-protected routes
├── api/             # API route handlers
└── auth/callback/   # OAuth callback
```

### Authentication Strategy

**Dual Authentication System:**

1. **Parent Auth** (Supabase)
   - OAuth providers (Google, etc.)
   - Email/password
   - Server-side session management
   - Middleware protection

2. **Kid Auth** (Custom PIN)
   - No email required
   - 4-digit PIN per kid profile
   - Cookie-based sessions (1 hour)
   - Independent from parent auth

### Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─── Supabase Auth (Parents)
       │    └─── Session Cookie
       │
       └─── API Routes
            ├─── Middleware (Auth Check)
            ├─── Prisma (Database)
            ├─── Claude API (AI)
            └─── Supabase Storage (Files)
```

## Database Schema

### Core Models

**User (Parent)**
- Linked to Supabase Auth via `supabaseId`
- One-to-many with Kids
- Owns transactions and rewards

**Kid**
- Belongs to User
- Has PIN for independent access
- Tracks balance
- Has transactions and reward claims

**Transaction**
- Belongs to Kid and User
- Types: CHORE, ALLOWANCE, PURCHASE, BONUS, PENALTY
- Statuses: PENDING, APPROVED, REJECTED, COMPLETED
- Updates kid balance on creation

**Reward & RewardClaim**
- Rewards catalog created by parents
- Kids claim rewards
- Claims tracked with status

**ChatMessage**
- Stores Claude AI conversations
- Grouped by sessionId
- Supports context retrieval

### Relationships

```
User (1) ─────── (N) Kid
  │                  │
  │                  ├── (N) Transaction
  │                  └── (N) RewardClaim
  │                           │
  └─── (N) Reward ─────────(N)
```

## Key Libraries

### lib/supabase/
- `client.ts` - Browser Supabase client
- `server.ts` - Server-side Supabase client (cookies)
- `proxy.ts` - Middleware session handler

### lib/auth/
- `kid-session.ts` - PIN-based session management for kids

### lib/ai/
- `claude.ts` - Claude API integration with helpers:
  - Age-appropriate financial explanations
  - Chore compensation suggestions
  - Savings goal messages

### lib/storage/
- `supabase-storage.ts` - File upload utilities for avatars and receipts

### lib/
- `db.ts` - Prisma client singleton
- `types.ts` - Shared TypeScript types
- `utils.ts` - Utility functions (cn, etc.)

## API Routes

All routes in `app/api/`:

| Route | Methods | Description |
|-------|---------|-------------|
| `/kids` | GET, POST | List and create kids |
| `/kid-session` | GET, POST, DELETE | Kid PIN authentication |
| `/transactions` | GET, POST | Transaction CRUD |
| `/chat` | POST | Claude AI chat |
| `/rewards` | GET, POST | Rewards management (not implemented) |

## Middleware Flow

```typescript
Request → updateSession() → Check Auth
   │
   ├─── Public path? → Continue
   ├─── Kid mode? → Continue (uses separate auth)
   ├─── No user? → Redirect to /login
   └─── Has user + auth page? → Redirect to /dashboard
```

## Security Considerations

### Current Implementation

✅ Server-side authentication with Supabase
✅ HTTP-only cookies for sessions
✅ Middleware route protection
✅ Zod validation on API inputs
✅ CSRF protection via SameSite cookies

### Production Recommendations

⚠️ Hash kid PINs with bcrypt/argon2
⚠️ Implement rate limiting on PIN attempts
⚠️ Enable Supabase Row Level Security (RLS)
⚠️ Add API rate limiting
⚠️ Sanitize all user inputs
⚠️ Use HTTPS only
⚠️ Monitor Claude API usage/costs

## Environment Configuration

### Required
- `DATABASE_URL` - PostgreSQL connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `ANTHROPIC_API_KEY` - Claude API key

### Optional
- `QSTASH_*` - Background job processing
- `NEXT_PUBLIC_APP_URL` - For OAuth redirects

## File Upload Flow

```
Browser → Upload File → API Route
            │
            ├─── Validate file type/size
            ├─── Generate unique filename
            └─── Upload to Supabase Storage
                 └─── Return public URL
```

## AI Integration

### Claude Use Cases

1. **Financial Education** (`explainFinancialConcept`)
   - Kid asks: "What is saving?"
   - Claude responds with age-appropriate explanation

2. **Chore Compensation** (`suggestChoreCompensation`)
   - Parent creates chore
   - Claude suggests fair payment based on complexity and kid's age

3. **Savings Motivation** (`generateSavingsGoalMessage`)
   - Kid has savings goal
   - Claude generates encouraging progress message

### Chat System

- Conversations stored in `ChatMessage` table
- Grouped by `sessionId`
- Last 20 messages retrieved for context
- Supports both parent and kid modes

## Scalability Considerations

### Current Bottlenecks

1. **Prisma Instance** - Create singleton to avoid connection issues
2. **Claude API** - Can be slow/expensive for high volume
3. **File Storage** - Consider CDN for avatars

### Future Optimizations

- Add Redis for session storage
- Implement response caching for Claude
- Use Prisma connection pooling
- Add database indexes for common queries
- Implement pagination for transaction lists
- Add image optimization/compression

## Deployment Architecture

### Recommended Setup

```
Vercel (Next.js App)
    ↓
Supabase (Auth + Storage + PostgreSQL)
    ↓
Anthropic API (Claude)
```

### Alternative Stack

- **Hosting**: Netlify, Railway, Render
- **Database**: Neon, PlanetScale, Railway PostgreSQL
- **Storage**: Cloudflare R2, AWS S3
- **Auth**: Keep Supabase or use Auth.js

## Testing Strategy (To Implement)

### Unit Tests
- Utility functions
- Zod schemas
- Kid session management

### Integration Tests
- API route handlers
- Authentication flows
- Database operations

### E2E Tests
- Login/signup flows
- Kid mode PIN entry
- Transaction creation
- Reward claiming

### Tools
- Jest for unit tests
- Playwright for E2E
- Testing Library for React components

## Monitoring & Observability

### Key Metrics to Track

1. **Authentication**
   - Login success/failure rate
   - PIN verification attempts
   - Session duration

2. **Transactions**
   - Transaction creation rate
   - Average transaction amount
   - Transaction type distribution

3. **AI Usage**
   - Claude API calls per day
   - Average tokens per request
   - Response time

4. **Performance**
   - Page load times
   - API response times
   - Database query times

### Recommended Tools

- Vercel Analytics (if using Vercel)
- Sentry for error tracking
- PostHog for product analytics
- Upstash for Redis + monitoring

## Future Enhancements

### Phase 2 Features
- [ ] Recurring allowance scheduler
- [ ] Savings goals with milestones
- [ ] Parent-kid messaging
- [ ] Transaction approval workflow
- [ ] Chore photo proof

### Phase 3 Features
- [ ] Mobile app (React Native)
- [ ] Spending analytics dashboard
- [ ] Gamification (badges, levels)
- [ ] Real payment integration (Stripe)
- [ ] Multi-language support

### Phase 4 Features
- [ ] Family sharing (grandparents)
- [ ] Educational mini-games
- [ ] Financial literacy curriculum
- [ ] Community marketplace
- [ ] Investment simulator
