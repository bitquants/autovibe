# Social Media OAuth Setup Guide

This guide explains how to connect social media platforms (Facebook, Twitter, Instagram, YouTube) for OAuth authentication in your AutoVibe application.

## Overview

The application uses Supabase Auth for OAuth authentication. When users connect their social media accounts, they can:
- Log in using their social media credentials
- Post content directly to connected platforms
- Manage multiple platform connections from the settings page

## Supported Platforms

### 1. Facebook

#### Step 1: Create a Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Consumer" or "Business" app type
4. Fill in app details (App Name, Contact Email)
5. Click "Create App"

#### Step 2: Configure Facebook Login
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" as the platform
4. Enter your site URL: `http://localhost:3000` (for development) or your production URL

#### Step 3: Get Credentials
1. Go to Settings → Basic
2. Copy the **App ID** and **App Secret**
3. Add these to your `.env.local`:
   ```
   FACEBOOK_CLIENT_ID=your_app_id
   FACEBOOK_CLIENT_SECRET=your_app_secret
   ```

#### Step 4: Configure OAuth Redirects
1. In Facebook Login → Settings
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/facebook/callback` (development)
   - `https://yourdomain.com/api/auth/facebook/callback` (production)

#### Step 5: Configure Supabase
1. Go to your Supabase Dashboard → Authentication → Providers
2. Find Facebook and enable it
3. Enter the App ID and App Secret
4. Save changes

---

### 2. Twitter (X)

#### Step 1: Create a Twitter App
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign in and go to "Projects & Apps"
3. Create a new project if you don't have one
4. Click "Create App"
5. Give your app a name

#### Step 2: Configure OAuth Settings
1. In your app settings, go to "User authentication settings"
2. Enable OAuth 2.0
3. Set App permissions to "Read and Write"
4. Set Type of App to "Web App"
5. Add Callback URLs:
   - `http://localhost:3000/api/auth/twitter/callback` (development)
   - `https://yourdomain.com/api/auth/twitter/callback` (production)
6. Add Website URL: `http://localhost:3000` or your production URL

#### Step 3: Get Credentials
1. Go to "Keys and Tokens" tab
2. Copy **Client ID** and **Client Secret**
3. Add to `.env.local`:
   ```
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   ```

#### Step 4: Configure Supabase
1. In Supabase Dashboard → Authentication → Providers
2. Find Twitter and enable it
3. Enter Client ID and Client Secret
4. Save changes

---

### 3. Google (YouTube)

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

#### Step 2: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (for public use) or "Internal" (for organization)
3. Fill in app information:
   - App name: AutoVibe
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `https://www.googleapis.com/auth/youtube.upload` (for posting)
5. Add test users (for external apps in testing mode)

#### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/youtube/callback` (development)
   - `https://yourdomain.com/api/auth/youtube/callback` (production)
5. Click "Create"
6. Copy **Client ID** and **Client Secret**

#### Step 4: Configure Environment
Add to `.env.local`:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

#### Step 5: Configure Supabase
1. In Supabase Dashboard → Authentication → Providers
2. Find Google and enable it
3. Enter Client ID and Client Secret
4. Save changes

---

### 4. Instagram

**Note**: Instagram uses Facebook's Graph API for authentication.

#### Step 1: Use Facebook App
Use the same Facebook app created earlier and add Instagram Basic Display product.

#### Step 2: Add Instagram Product
1. In your Facebook app, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"

#### Step 3: Configure Instagram
1. Go to Instagram Basic Display → Settings
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/instagram/callback` (development)
   - `https://yourdomain.com/api/auth/instagram/callback` (production)
3. Add Deauthorize Callback URL and Data Deletion URL (can be your homepage)

#### Step 4: Get Instagram App Credentials
1. In Instagram Basic Display → Settings
2. Copy **Instagram App ID** and **Instagram App Secret**
3. Add to `.env.local`:
   ```
   INSTAGRAM_CLIENT_ID=your_instagram_app_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
   ```

#### Step 5: Add Instagram Tester (for development)
1. Go to Instagram Basic Display → Roles
2. Add Instagram Testers
3. Enter the Instagram username you want to test with
4. The user must accept the invitation in their Instagram app

---

## Environment Variables Summary

Add these to your `.env.local` file:

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Google OAuth (for YouTube)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Instagram OAuth (via Facebook)
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
```

## Supabase Configuration

All OAuth providers must be configured in your Supabase project:

1. Go to [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to Authentication → Providers
4. Enable and configure each provider with the credentials from above
5. Make sure the redirect URLs match your application's callback routes

## Testing OAuth Locally

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click on the OAuth provider buttons (Facebook, Twitter, Google)
4. Complete the authentication flow
5. You should be redirected back to the dashboard

## Troubleshooting

### "Invalid redirect URI" Error
- Make sure the redirect URI in your OAuth app settings exactly matches your callback URL
- Include `http://` or `https://` and the full path

### "App not active" Error (Facebook)
- Your Facebook app needs to be in "Live" mode for public use
- Or add test users while in development mode

### OAuth Popup Blocked
- Make sure your browser allows popups from your domain
- Some browsers block OAuth popups by default

### Supabase Auth Errors
- Check Supabase logs in the dashboard
- Verify all credentials are correctly entered
- Ensure the provider is enabled in Supabase

## Production Deployment

Before deploying to production:

1. Update all OAuth apps with production URLs
2. Switch Facebook app to "Live" mode
3. Submit Google OAuth app for verification (if using sensitive scopes)
4. Update Supabase redirect URLs to production domain
5. Add production environment variables to your hosting platform

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Twitter OAuth 2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api/)