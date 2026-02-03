# OAuth Setup Summary for AutoVibe

## Current Deployment
- **Live URL:** https://app1-five-pink.vercel.app
- **Vercel Project:** app1

## Required OAuth Setup Steps

### 1. Twitter (X) OAuth Setup

**Step 1: Create Twitter App**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign in with your Twitter account
3. Create a new project and app
4. Enable OAuth 2.0 in User authentication settings

**Step 2: Configure Callback URLs**
Add these redirect URLs in your Twitter app:
```
https://app1-five-pink.vercel.app/api/auth/twitter/callback
```

**Step 3: Get Credentials**
- Copy Client ID and Client Secret
- Add to Vercel environment variables:
```bash
vercel env add TWITTER_CLIENT_ID production
vercel env add TWITTER_CLIENT_SECRET production
```

**Step 4: Configure Supabase**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Twitter provider
3. Enter Client ID and Client Secret

### 2. Facebook OAuth Setup

**Step 1: Create Facebook App**
1. Go to https://developers.facebook.com/apps
2. Create new app (select "Consumer" type)
3. Add Facebook Login product

**Step 2: Configure OAuth Redirects**
Add Valid OAuth Redirect URIs:
```
https://app1-five-pink.vercel.app/api/auth/facebook/callback
```

**Step 3: Get Credentials**
- Copy App ID and App Secret from Settings → Basic
- Add to Vercel:
```bash
vercel env add FACEBOOK_APP_ID production
vercel env add FACEBOOK_APP_SECRET production
```

**Step 4: Configure Supabase**
1. Supabase Dashboard → Authentication → Providers
2. Enable Facebook provider
3. Enter App ID and App Secret

### 3. YouTube (Google) OAuth Setup

**Step 1: Create Google Cloud Project**
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable YouTube Data API v3

**Step 2: Configure OAuth Consent Screen**
1. APIs & Services → OAuth consent screen
2. Select "External" for public use
3. Fill in app name and user support email
4. Add authorized domain: `app1-five-pink.vercel.app`

**Step 3: Create OAuth Credentials**
1. APIs & Services → Credentials
2. Create OAuth client ID (Web application)
3. Add Authorized redirect URIs:
```
https://app1-five-pink.vercel.app/api/auth/youtube/callback
```

**Step 4: Get Credentials**
- Copy Client ID and Client Secret
- Add to Vercel:
```bash
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
```

**Step 5: Configure Supabase**
1. Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Enter Client ID and Client Secret

## Environment Variables Already Added
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ MOONSHOT_API_KEY
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✅ STRIPE_SECRET_KEY

## Next Steps
1. Set up OAuth apps in each platform's developer console
2. Add the callback URLs shown above
3. Add the credentials to Vercel environment variables
4. Configure the providers in Supabase Authentication
5. Redeploy if needed: `vercel --prod`

## Testing OAuth
After setup, users can:
1. Go to Settings page
2. Click "Connect" next to each platform
3. Authorize the app
4. Post content directly to connected platforms
