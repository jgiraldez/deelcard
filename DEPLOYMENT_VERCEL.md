# Deploying DealCard to Vercel

This guide walks you through deploying your DealCard application to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project set up
- Anthropic API key

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: DealCard app with Supabase, Prisma, and Claude AI"
```

### 1.2 Push to GitHub

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/dealcard.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `dealcard` (or your choice)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Wait 2-3 minutes for project creation

### 2.2 Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. **Optional:** Enable Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

### 2.3 Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Create bucket: `avatars`
   - Make it **Public**
3. Create bucket: `receipts`
   - Keep **Public** or set up RLS for privacy

### 2.4 Get Database Connection String

1. Go to **Project Settings** → **Database**
2. Copy the **Connection Pooling** string (uses port 6543)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this for Vercel environment variables

Example:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 2.5 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (long JWT token)

## Step 3: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** in settings
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-api03-`)
6. **Important:** Save it securely - you won't see it again!

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repository (`dealcard`)
4. Click **Import**

### 4.2 Configure Project

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (leave default)
**Build Command:** `next build` (default)
**Output Directory:** `.next` (default)

### 4.3 Add Environment Variables

Click **Environment Variables** and add the following:

#### Required Variables

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (your anon key) |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` |

#### Optional Variables

| Name | Value |
|------|-------|
| `QSTASH_URL` | `https://qstash.upstash.io` (if using QStash) |
| `QSTASH_TOKEN` | Your QStash token |
| `QSTASH_CURRENT_SIGNING_KEY` | Your signing key |
| `QSTASH_NEXT_SIGNING_KEY` | Your next signing key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

**Tip:** Apply to all environments (Production, Preview, Development)

### 4.4 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Step 5: Configure OAuth Redirects

### 5.1 Update Supabase Redirect URLs

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-project.vercel.app/auth/callback
   https://your-project-*.vercel.app/auth/callback
   ```
3. Update **Site URL** to: `https://your-project.vercel.app`

### 5.2 Update Google OAuth (if enabled)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth credentials
3. Add **Authorized redirect URI**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

## Step 6: Initialize Database

You have two options:

### Option A: From Local Machine (Recommended)

```bash
# Make sure DATABASE_URL in .env points to Supabase
npm run db:generate
npm run db:push
```

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull

# Run Prisma commands
npm run db:generate
npm run db:push
```

## Step 7: Test Your Deployment

1. Visit `https://your-project.vercel.app`
2. Test signup with email
3. Check email for verification link
4. Log in to dashboard
5. Add a kid profile
6. Test kid mode with PIN
7. Create a transaction
8. Test Claude AI chat

## Step 8: Set Up Custom Domain (Optional)

### 8.1 Add Domain in Vercel

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `dealcard.com`)
4. Follow DNS configuration instructions

### 8.2 Update Supabase URLs

1. Add your custom domain to Supabase redirect URLs
2. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars

## Monitoring & Maintenance

### View Logs

1. Go to your project in Vercel
2. Click **Deployments**
3. Select a deployment
4. View **Functions** and **Logs**

### Monitor Performance

Vercel provides built-in analytics:
- **Speed Insights**: Page load performance
- **Web Analytics**: User traffic and behavior

Enable in: **Settings** → **Analytics**

### Database Management

Use Prisma Studio to view/edit data:

```bash
npm run db:studio
```

Or use Supabase dashboard: **Table Editor**

## Troubleshooting

### Build Fails: "Prisma Client not generated"

**Solution:** Add build command in Vercel:
1. Go to **Settings** → **General**
2. Override build command: `npm run db:generate && next build`

### Environment Variables Not Working

**Solution:**
- Make sure they're applied to Production environment
- Redeploy after adding variables
- Check for typos in variable names

### OAuth Redirect Errors

**Solution:**
- Verify redirect URLs in Supabase match Vercel URLs
- Include both `your-app.vercel.app` and `your-app-*.vercel.app`
- Clear browser cookies and try again

### Database Connection Issues

**Solution:**
- Use Supabase **Connection Pooling** string (port 6543)
- Not the direct connection (port 5432)
- Ensure password is URL-encoded if it contains special characters

### 500 Errors on API Routes

**Solution:**
- Check Vercel Function logs
- Verify all environment variables are set
- Ensure Prisma Client is generated during build

## Cost Considerations

### Vercel Pricing
- **Hobby (Free):** Good for development and small projects
  - 100 GB bandwidth
  - 100 GB-Hrs serverless function execution
- **Pro ($20/month):** For production apps
  - 1 TB bandwidth
  - 1000 GB-Hrs function execution

### Supabase Pricing
- **Free Tier:**
  - 500 MB database
  - 1 GB file storage
  - 50,000 monthly active users
- **Pro ($25/month):**
  - 8 GB database
  - 100 GB file storage
  - 100,000 monthly active users

### Anthropic Pricing
- **Claude 3.5 Sonnet:**
  - Input: $3 per million tokens
  - Output: $15 per million tokens
- **Estimate:** ~$0.01-0.05 per conversation
- **Budget tip:** Set usage limits in Anthropic console

## Security Best Practices

### 1. Enable Supabase RLS (Row Level Security)

```sql
-- Example RLS policy for Kid table
ALTER TABLE "Kid" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own kids"
ON "Kid" FOR SELECT
USING (auth.uid() = (SELECT "supabaseId" FROM "User" WHERE id = "userId"));
```

### 2. Set Up Vercel Firewall (Pro Plan)

- Block malicious IPs
- Rate limiting
- DDoS protection

### 3. Monitor API Usage

- Set up Anthropic usage alerts
- Monitor Supabase bandwidth
- Track Vercel function invocations

### 4. Secure Environment Variables

- Never commit `.env` to Git
- Rotate API keys regularly
- Use Vercel's encrypted storage

## CI/CD Pipeline

Vercel automatically deploys:
- **Production:** Pushes to `main` branch
- **Preview:** Pull requests and other branches

### Branch Strategy

```
main (production)
  ├── develop (staging)
  └── feature/* (preview deployments)
```

## Backup Strategy

### Database Backups

Supabase provides daily backups (Pro plan). To manually backup:

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Code Backups

- GitHub is your primary backup
- Vercel keeps deployment history
- Consider GitHub Actions for automated backups

## Next Steps

✅ App deployed successfully!

Now you can:
1. Share your app URL with users
2. Set up analytics and monitoring
3. Configure custom domain
4. Enable Supabase RLS policies
5. Set up error tracking (Sentry)
6. Add uptime monitoring (UptimeRobot)
7. Create staging environment

## Useful Commands

```bash
# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add

# List deployments
vercel list
```

## Support

### Vercel Support
- Docs: [vercel.com/docs](https://vercel.com/docs)
- Support: [vercel.com/support](https://vercel.com/support)

### Supabase Support
- Docs: [supabase.com/docs](https://supabase.com/docs)
- Community: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

### Project Issues
- GitHub Issues: Create issues in your repository
- Refer to [SETUP.md](SETUP.md) for troubleshooting

---

**Congratulations! Your DealCard app is now live on Vercel! 🎉**
