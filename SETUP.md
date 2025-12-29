# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned (~2 minutes)
3. Go to **Project Settings** > **API**
4. Copy your **Project URL** and **anon/public** key

### Configure Supabase Auth

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. (Optional) Enable **Google** OAuth:
   - Go to Google Cloud Console
   - Create OAuth credentials
   - Add to Supabase

### Create Storage Buckets

1. Go to **Storage** in the Supabase dashboard
2. Create two buckets:
   - `avatars` (Public)
   - `receipts` (Public or Private with RLS)

## 3. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Go to **API Keys** in settings
4. Create a new key
5. Copy the key (starts with `sk-ant-api03-`)

## 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Your Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# From Supabase Project Settings > API
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."

# From Anthropic Console
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

## 5. Initialize Database

```bash
npm run db:generate
npm run db:push
```

## 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 7. Create Your First Account

1. Click "Sign Up"
2. Enter email and password
3. Check email for verification link (if enabled)
4. Sign in and access dashboard

## Troubleshooting

### Can't connect to database

**Error:** `Can't reach database server`

**Solution:** Make sure you're using the **direct** connection string from Supabase:
- Go to **Project Settings** > **Database**
- Copy the **Connection Pooling** URI (not the direct connection)
- Use port `6543` instead of `5432`

### Prisma errors

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npm run db:generate
```

### Supabase auth errors

**Error:** `Invalid JWT` or `Session not found`

**Solution:**
- Clear browser cookies
- Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY match your project
- Ensure you're not mixing up different Supabase projects

### TypeScript errors

**Solution:**
```bash
npm run build
```

This will show all TypeScript errors. Fix them before running `npm run dev`.

## Optional: Upstash QStash

For background jobs and scheduled tasks:

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a QStash instance
3. Copy credentials to `.env`:

```env
QSTASH_URL="https://qstash.upstash.io"
QSTASH_TOKEN="..."
QSTASH_CURRENT_SIGNING_KEY="..."
QSTASH_NEXT_SIGNING_KEY="..."
```

## Development Workflow

```bash
# Start dev server
npm run dev

# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# View database in browser
npm run db:studio

# Build for production
npm run build
```

## Deployment Checklist

- [ ] Set all environment variables in hosting platform
- [ ] Add OAuth redirect URLs to Supabase
  - Format: `https://yourdomain.com/auth/callback`
- [ ] Update NEXT_PUBLIC_APP_URL
- [ ] Test authentication flow
- [ ] Enable Supabase RLS policies for production
- [ ] Set up database backups
- [ ] Monitor Anthropic API usage
