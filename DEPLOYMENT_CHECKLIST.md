# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

### Code Preparation
- [ ] All code committed to Git
- [ ] `.env` file NOT committed (only `.env.example`)
- [ ] No console.logs or debug code in production
- [ ] All TypeScript errors resolved (`npm run build` succeeds)
- [ ] Test locally with production build (`npm run build && npm start`)

### GitHub Repository
- [ ] Repository created on GitHub
- [ ] Code pushed to `main` branch
- [ ] Repository is public or accessible to Vercel

## Supabase Setup

### Project Creation
- [ ] Supabase project created
- [ ] Project name: `dealcard` (or custom)
- [ ] Database password saved securely
- [ ] Region selected (closest to users)

### Authentication
- [ ] Email authentication enabled
- [ ] Google OAuth configured (optional)
- [ ] OAuth redirect URLs added (will update after Vercel deployment)

### Storage
- [ ] `avatars` bucket created (Public)
- [ ] `receipts` bucket created (Public or RLS)

### Database
- [ ] Connection pooling string copied (port 6543)
- [ ] Password saved securely

### API Keys
- [ ] Project URL copied: `https://xxxxx.supabase.co`
- [ ] Anon/public key copied: `eyJhbGci...`

## Anthropic Setup

- [ ] Account created at console.anthropic.com
- [ ] API key generated: `sk-ant-api03-...`
- [ ] API key saved securely
- [ ] Usage limits set (optional but recommended)

## Vercel Deployment

### Import Project
- [ ] Logged into Vercel
- [ ] GitHub repository imported
- [ ] Framework preset: Next.js (auto-detected)

### Environment Variables
Add all of these in Vercel dashboard:

**Required:**
- [ ] `DATABASE_URL` (Supabase connection pooling string)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `ANTHROPIC_API_KEY`

**Optional:**
- [ ] `QSTASH_URL` (if using QStash)
- [ ] `QSTASH_TOKEN`
- [ ] `QSTASH_CURRENT_SIGNING_KEY`
- [ ] `QSTASH_NEXT_SIGNING_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (your Vercel URL)

**Environment Options:**
- [ ] Variables applied to: Production ✓
- [ ] Variables applied to: Preview ✓
- [ ] Variables applied to: Development ✓

### Deploy
- [ ] Build command: `next build` (default is fine)
- [ ] Output directory: `.next` (default is fine)
- [ ] Node.js version: 20.x (default)
- [ ] Click "Deploy" button
- [ ] Build succeeds (2-3 minutes)
- [ ] Deployment URL received: `https://your-app.vercel.app`

## Post-Deployment

### Update OAuth Redirects
- [ ] Copy Vercel deployment URL
- [ ] Go to Supabase → Authentication → URL Configuration
- [ ] Add redirect URLs:
  - [ ] `https://your-app.vercel.app/auth/callback`
  - [ ] `https://your-app-*.vercel.app/auth/callback`
- [ ] Update Site URL: `https://your-app.vercel.app`

### Initialize Database
Choose one method:

**Option A: Local**
- [ ] Update local `.env` with Supabase DATABASE_URL
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:push`

**Option B: Vercel CLI**
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run `vercel env pull`
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:push`

### Testing
- [ ] Visit deployment URL
- [ ] Homepage loads correctly
- [ ] Click "Sign Up"
- [ ] Create account with email
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Log in successfully
- [ ] Dashboard loads
- [ ] Click "Add Child" (test if API works)
- [ ] Add kid profile with name and PIN
- [ ] Kid appears in dashboard
- [ ] Visit `/kid-mode`
- [ ] Select kid profile
- [ ] Enter PIN
- [ ] Kid dashboard loads
- [ ] Sign out works
- [ ] Test Claude AI (if chat feature accessible)

## Optional Enhancements

### Custom Domain
- [ ] Domain purchased (e.g., dealcard.com)
- [ ] Domain added in Vercel Settings → Domains
- [ ] DNS records configured
- [ ] SSL certificate issued (automatic)
- [ ] Update Supabase redirect URLs with custom domain
- [ ] Update `NEXT_PUBLIC_APP_URL` in Vercel

### Analytics
- [ ] Vercel Analytics enabled
- [ ] Vercel Speed Insights enabled
- [ ] Google Analytics added (optional)

### Monitoring
- [ ] Sentry error tracking set up (optional)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up Anthropic usage alerts

### Security
- [ ] Supabase RLS policies enabled
- [ ] API rate limiting considered
- [ ] Environment variables verified secure
- [ ] Security headers configured

### Documentation
- [ ] Update README.md with deployment URL
- [ ] Document any custom configurations
- [ ] Update team on new deployment

## Production Optimizations

### Performance
- [ ] Enable Vercel Image Optimization
- [ ] Configure caching headers
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit (aim for 90+)

### Database
- [ ] Add database indexes for common queries
- [ ] Set up database connection pooling
- [ ] Enable Prisma query logging (development only)
- [ ] Plan backup strategy

### Cost Management
- [ ] Set Anthropic usage limits
- [ ] Monitor Vercel bandwidth
- [ ] Check Supabase usage
- [ ] Set up billing alerts

## Rollback Plan

If deployment fails:

1. **Check Vercel build logs** for errors
2. **Verify environment variables** are correct
3. **Test locally** with same env vars
4. **Rollback to previous deployment** in Vercel if needed
5. **Check Supabase status** at status.supabase.com

## Team Communication

After successful deployment:

- [ ] Notify team of deployment
- [ ] Share deployment URL
- [ ] Share admin credentials (securely)
- [ ] Document any known issues
- [ ] Schedule team walkthrough

## Next Deployments

For future deployments:

- [ ] Create `develop` branch for staging
- [ ] Set up preview deployments for PRs
- [ ] Document deployment process
- [ ] Create deployment runbook
- [ ] Set up CI/CD pipeline

---

## Deployment Notes

**Deployment Date:** __________
**Deployed By:** __________
**Deployment URL:** __________
**Version/Commit:** __________

**Issues Encountered:**
- [ ] None
- [ ] Issue 1: _________________
- [ ] Issue 2: _________________

**Time Taken:**
- Setup: _____ minutes
- Deployment: _____ minutes
- Testing: _____ minutes
- Total: _____ minutes

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Failed

## Quick Reference

| Service | URL |
|---------|-----|
| App | https://your-app.vercel.app |
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://supabase.com/dashboard |
| Anthropic Console | https://console.anthropic.com |
| GitHub Repo | https://github.com/username/dealcard |

| Credential | Location |
|------------|----------|
| Database Password | Password manager |
| Anthropic API Key | Password manager |
| Supabase Keys | Password manager |
| Vercel Access | Password manager |

---

**✅ Deployment Complete! Your app is live!**
