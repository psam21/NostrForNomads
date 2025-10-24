# Vercel KV Setup Guide

This document explains how to set up Vercel KV (Redis) for event logging.

## Overview

The user event logging feature requires Vercel KV (managed Redis) to store event analytics. This same KV instance is used for both development and production.

---

## Setup Steps

### 1. Create Vercel KV Database

1. **Navigate to your Vercel project dashboard**
   - Go to https://vercel.com/dashboard
   - Select your `ncoin` project

2. **Create a KV Database**
   - Click on the **Storage** tab
   - Click **Create Database**
   - Select **KV** (Redis-compatible key-value store)
   - Choose a name (e.g., `ncoin-events`)
   - Select a region close to your users
   - Click **Create**

3. **Connect to your project**
   - After creation, click **Connect Project**
   - Select your `ncoin` project
   - Choose which environments to connect:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (for local dev)
   - Click **Connect**

### 2. Local Development

Once you've connected the KV database to your project with the "Development" environment enabled, the environment variables are automatically available.

**Option A: Use Vercel CLI (Recommended)**

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Link your project**
   ```bash
   vercel link
   ```

3. **Run dev server with Vercel**
   ```bash
   vercel dev
   ```
   
   This automatically pulls your environment variables from Vercel.

**Option B: Manual .env.local (Optional)**

If you prefer `npm run dev` instead of `vercel dev`:

1. **Get credentials from Vercel dashboard**
   - Storage → Your KV database → `.env.local` tab
   
2. **Create `.env.local`** and paste the credentials

3. **Run dev server**
   ```bash
   npm run dev
   ```

**Verify it's working:**
- Visit `http://localhost:3000/user-event-log`
- Send a message in your app
- Check if events appear in the log

### 3. Production Deployment

1. **Verify environment variables in Vercel**
   - Go to your project **Settings** → **Environment Variables**
   - Verify these variables are set (auto-added when you connected KV):
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

2. **Deploy your application**
   ```bash
   git push origin main
   ```
   
   Or trigger a redeploy from the Vercel dashboard.

3. **Verify it's working in production**
   - Visit your production site at `/user-event-log`
   - Send a message
   - Check if events appear in the log

---

## Troubleshooting

### "Redis connection not available" errors

**Check environment variables:**
```bash
# Verify your .env.local has KV credentials
cat .env.local
```

**For Vercel KV:**
- Verify environment variables are set in Vercel dashboard
- Ensure you've redeployed after adding variables
- Check Vercel deployment logs for connection errors
- Make sure you connected KV to the "Development" environment

### Events not appearing in `/user-event-log`

1. **Check browser console** for API errors
2. **Check server logs** for Redis connection issues
3. **Verify event logging is being called:**
   - Send a message
   - Check browser Network tab for POST to `/api/log-event`
   - Should return `{"success": true, "message": "Event analytics stored successfully"}`

4. **Check Vercel KV dashboard:**
   - Go to Storage → Your KV database
   - Click **Data Browser** tab
   - Search for keys matching `user_events:*`

### Timeout errors (5 second timeout)

If you see "Event logging request failed (non-blocking) - Timeout":

1. **Check KV database status:**
   - Go to Vercel dashboard → Storage
   - Verify KV database is active

2. **Check region:**
   - KV region should be close to your deployment region
   - Check Vercel function logs for errors

3. **Verify credentials are correct:**
   - Regenerate credentials if needed
   - Update both `.env.local` and Vercel environment variables

---

## Data Schema

Events are stored with the following structure:

**Key Pattern:**
```
user_events:{npub}:{timestamp}:{eventId}
```

**Index Pattern:**
```
user_events_index:{npub} -> Sorted Set (sorted by timestamp)
```

**Event Data Structure:**
```typescript
{
  npub: string;
  eventId: string;
  eventKind: number;
  createdTimestamp: number;
  processedTimestamp: number;
  processingDuration: number;
  totalRelaysAttempted: number;
  successfulRelays: string[];
  failedRelays: string[];
  failedRelayReasons?: Record<string, string>;
  verifiedRelays?: string[];
  silentFailureRelays?: string[];
  unverifiedRelays?: string[];
  verificationTimestamp?: number;
  averageResponseTime: number;
  tagsCount: number;
  retryAttempts: number;
}
```

---

## Cost Considerations

### Vercel KV Pricing
- **Hobby (Free) tier**: 256 MB storage, 30,000 monthly commands
- **Pro tier**: 256 MB included, then $0.25/GB storage, $0.10/100K commands
- Check current pricing: https://vercel.com/docs/storage/vercel-kv/usage-and-pricing

For development and small-scale usage, the free tier should be sufficient.

**Monitor your usage:**
- Go to Vercel dashboard → Storage → Your KV database
- Click **Usage** tab to see current usage

---

## Next Steps

After setup:

1. ✅ Create Vercel KV database
2. ✅ Connect to your project (all environments)
3. ✅ Copy credentials to `.env.local`
4. ✅ Restart dev server
5. ✅ Send a test message in your app
6. ✅ Visit `/user-event-log` to verify events are being logged
7. ✅ Deploy to production and verify
8. ✅ Monitor KV usage to stay within free tier limits

For questions or issues, check the Vercel KV dashboard or application logs.
