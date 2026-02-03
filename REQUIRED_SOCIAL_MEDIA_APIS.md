# Required Social Media APIs for Integration

This document lists all the APIs needed to integrate each social media platform for OAuth authentication and content posting.

## Table of Contents
1. [Facebook / Instagram](#facebook--instagram)
2. [Twitter (X)](#twitter-x)
3. [YouTube](#youtube)

---

## Facebook / Instagram

### APIs Required

#### 1. Facebook Login API
**Purpose**: OAuth authentication for users  
**Documentation**: https://developers.facebook.com/docs/facebook-login/  
**Endpoint**: `https://www.facebook.com/v18.0/dialog/oauth`

**Required Permissions (Scopes)**:
- `email` - Access user's email
- `public_profile` - Access basic profile info
- `pages_read_engagement` - Read page engagement data
- `pages_manage_posts` - Post to Facebook pages
- `instagram_basic` - Read Instagram account info
- `instagram_content_publish` - Publish content to Instagram

#### 2. Facebook Graph API
**Purpose**: Post content to Facebook pages and read user data  
**Documentation**: https://developers.facebook.com/docs/graph-api/  
**Base URL**: `https://graph.facebook.com/v18.0/`

**Key Endpoints**:
- `POST /{page-id}/feed` - Post to Facebook page
- `GET /{user-id}/accounts` - Get user's managed pages
- `GET /{page-id}` - Get page details

#### 3. Instagram Graph API
**Purpose**: Post content to Instagram Business/Creator accounts  
**Documentation**: https://developers.facebook.com/docs/instagram-api/  
**Base URL**: `https://graph.facebook.com/v18.0/`

**Key Endpoints**:
- `POST /{ig-user-id}/media` - Create media container
- `POST /{ig-user-id}/media_publish` - Publish media
- `GET /{ig-user-id}` - Get account info

### Setup Requirements

1. **Facebook Developer Account**: https://developers.facebook.com/
2. **Business Verification**: Required for some permissions
3. **App Review**: Required for publishing permissions
4. **Instagram Business/Creator Account**: Personal accounts not supported

### Environment Variables
```env
FACEBOOK_APP_ID=887661387458086
FACEBOOK_APP_SECRET=fb41bffa7b19b8763f3048750cfac3a6
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
```

---

## Twitter (X)

### APIs Required

#### 1. Twitter OAuth 2.0
**Purpose**: OAuth authentication for users  
**Documentation**: https://developer.twitter.com/en/docs/authentication/oauth-2-0  
**Authorization URL**: `https://twitter.com/i/oauth2/authorize`

**Required Scopes**:
- `tweet.read` - Read tweets
- `tweet.write` - Post tweets
- `tweet.moderate.write` - Hide/reply to tweets
- `users.read` - Read user info
- `follows.read` - Read follows
- `follows.write` - Follow/unfollow users
- `offline.access` - Refresh token access

#### 2. Twitter API v2
**Purpose**: Post tweets and manage content  
**Documentation**: https://developer.twitter.com/en/docs/twitter-api  
**Base URL**: `https://api.twitter.com/2/`

**Key Endpoints**:
- `POST /tweets` - Create a tweet
- `POST /tweets/{id}/hidden` - Hide a reply
- `GET /users/{id}` - Get user info
- `GET /users/{id}/tweets` - Get user's tweets

#### 3. Twitter Media Upload API
**Purpose**: Upload images/videos for tweets  
**Documentation**: https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/overview  
**Base URL**: `https://upload.twitter.com/1.1/`

**Key Endpoints**:
- `POST /media/upload` - Upload media
- `GET /media/upload` - Check upload status

### Setup Requirements

1. **Twitter Developer Account**: https://developer.twitter.com/
2. **Elevated Access**: Required for posting tweets
3. **Project & App**: Create in Twitter Developer Portal
4. **User Authentication Settings**: Enable OAuth 2.0

### Environment Variables
```env
TWITTER_CLIENT_ID=r7QyrfIB5gAXDUIYQSNBCk6wR
TWITTER_CLIENT_SECRET=5l4vbMhIPQ2AZXuLPjx7YodNQGE1A9dkC4jocrUh2uaBvz2mQu
TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/twitter/callback
```

---

## YouTube

### APIs Required

#### 1. Google OAuth 2.0
**Purpose**: OAuth authentication for users  
**Documentation**: https://developers.google.com/identity/protocols/oauth2  
**Authorization URL**: `https://accounts.google.com/o/oauth2/v2/auth`

**Required Scopes**:
- `openid` - OpenID Connect
- `email` - User's email address
- `profile` - Basic profile info
- `https://www.googleapis.com/auth/youtube.readonly` - Read YouTube data
- `https://www.googleapis.com/auth/youtube.upload` - Upload videos
- `https://www.googleapis.com/auth/youtube.force-ssl` - Manage YouTube account

#### 2. YouTube Data API v3
**Purpose**: Manage YouTube content  
**Documentation**: https://developers.google.com/youtube/v3  
**Base URL**: `https://www.googleapis.com/youtube/v3/`

**Key Endpoints**:
- `POST /videos` - Upload a video
- `PUT /videos` - Update video metadata
- `GET /channels` - Get channel info
- `GET /playlists` - Get playlists
- `POST /playlistItems` - Add video to playlist

#### 3. YouTube Analytics API
**Purpose**: Get video/channel analytics  
**Documentation**: https://developers.google.com/youtube/analytics  
**Base URL**: `https://youtubeanalytics.googleapis.com/v2/`

**Key Endpoints**:
- `GET /reports` - Get analytics reports
- `GET /groupItems` - Get group items

### Setup Requirements

1. **Google Cloud Account**: https://console.cloud.google.com/
2. **YouTube Data API v3**: Enable in Google Cloud Console
3. **OAuth Consent Screen**: Configure app information
4. **API Credentials**: Create OAuth 2.0 credentials
5. **YouTube Channel**: User needs a YouTube channel

### Environment Variables
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
```

---

## API Comparison Summary

| Feature | Facebook/Instagram | Twitter | YouTube |
|---------|-------------------|---------|---------|
| **OAuth Version** | OAuth 2.0 | OAuth 2.0 | OAuth 2.0 |
| **Post Text** | ✅ | ✅ | ✅ (Description) |
| **Post Images** | ✅ | ✅ | ✅ (Thumbnail) |
| **Post Videos** | ✅ | ✅ | ✅ (Main content) |
| **Schedule Posts** | ✅ (via API) | ✅ (via API) | ✅ (via API) |
| **Analytics** | ✅ | ✅ | ✅ |
| **Rate Limits** | Tier-based | Tier-based | Quota-based |
| **Approval Required** | Yes (for publishing) | Yes (Elevated access) | No |

---

## Implementation Notes

### 1. OAuth Flow
All platforms use OAuth 2.0 with similar flow:
1. Redirect user to platform's authorization URL
2. User grants permissions
3. Platform redirects to your callback URL with code
4. Exchange code for access token
5. Store token securely (in database)
6. Use token for API calls

### 2. Token Storage
Store tokens in your database associated with the user:
```sql
social_accounts table:
- user_id (UUID)
- platform (enum)
- access_token (encrypted)
- refresh_token (encrypted)
- expires_at (timestamp)
- platform_user_id (string)
- account_name (string)
```

### 3. Token Refresh
All platforms support token refresh:
- **Facebook**: Long-lived tokens (60 days)
- **Twitter**: Refresh token with `offline.access` scope
- **Google**: Refresh token (no expiration)

### 4. Error Handling
Common errors to handle:
- **401 Unauthorized**: Token expired or revoked
- **403 Forbidden**: Insufficient permissions
- **429 Rate Limited**: Too many requests
- **500 Server Error**: Platform issue

### 5. Testing
Each platform provides:
- **Facebook**: Test Users, Development Mode
- **Twitter**: Sandbox environment
- **Google**: Test users in OAuth consent screen

---

## Cost Information

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| **Facebook** | Unlimited (with rate limits) | N/A |
| **Twitter** | 1,500 tweets/month (Essential) | $100/month (Elevated+) |
| **YouTube** | 10,000 units/day | $0 (pay for quota increases) |

---

## Additional Resources

- **Facebook**: https://developers.facebook.com/docs/
- **Twitter**: https://developer.twitter.com/en/docs
- **YouTube**: https://developers.google.com/youtube/v3/getting-started
- **Supabase Auth**: https://supabase.com/docs/guides/auth/social-login
