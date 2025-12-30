# Supabase Setup Guide

This guide explains how to configure Supabase authentication for DealCard.

## Email Confirmation Setup

### Redirect URLs Configuration

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add the following URLs to **Redirect URLs**:

**For Local Development:**
```
http://localhost:3000/auth/callback
http://localhost:3000
```

**For Production (Vercel):**
```
https://deelcard.vercel.app/auth/callback
https://deelcard.vercel.app
```

### How It Works

When a user signs up:
1. Supabase sends a confirmation email with a link like:
   - `http://localhost:3000/?code=xxx` (local)
   - `https://deelcard.vercel.app/?code=xxx` (production)

2. The `AuthHandler` component on the home page detects the `code` parameter

3. It automatically redirects to `/auth/callback?code=xxx`

4. The callback route exchanges the code for a session

5. User is redirected to `/dashboard`

## Environment Variables

Make sure you have these environment variables set:

### Local Development (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### Vercel Production
Add the same variables in Vercel Dashboard:
- Project Settings → Environment Variables
- Add `NEXT_PUBLIC_SUPABASE_URL`
- Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing Email Confirmation

1. Sign up with a real email address
2. Check your inbox for the confirmation email
3. Click the confirmation link
4. You should be redirected to the dashboard
5. If there's an error, check the browser console and Supabase logs

## Troubleshooting

### "auth-callback-error" in URL
- Check that the redirect URLs are configured correctly in Supabase
- Verify the code is being passed correctly
- Check Supabase logs for authentication errors

### Email not received
- Check spam/junk folder
- Verify email settings in Supabase → Authentication → Email Templates
- Check Supabase logs for email sending errors

### Redirect to wrong URL
- Ensure all redirect URLs are added to Supabase configuration
- Check that environment variables are set correctly
- Clear browser cache and cookies

## Email Templates (Optional)

You can customize email templates in Supabase:
- Go to **Authentication** → **Email Templates**
- Customize the "Confirm signup" template
- Use variables like `{{ .ConfirmationURL }}` for the link
