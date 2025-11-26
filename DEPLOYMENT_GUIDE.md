# Deployment Guide: Running Your App with Ngrok for Multiple Users

## Overview

This guide explains how to run your Bansfield Connections app so multiple users can access it via GitHub Pages (frontend) with an ngrok URL (backend API).

## Architecture

- **Frontend**: Hosted on GitHub Pages (static React app)
- **Backend**: Node.js/Express server with SQLite database, exposed via ngrok
- **Database**: SQLite with WAL mode for better concurrent access

## Prerequisites

- Node.js installed
- ngrok installed (download from https://ngrok.com/)
- Repository deployed to GitHub Pages

## Step-by-Step Setup

### 1. Initial Database Setup

Run this command **once** to create and initialize your database:

```bash
npm run setup-db
```

This creates the SQLite database with the proper schema and sample data.

### 2. Start Your Backend Server

In one terminal window, run:

```bash
npm run server
```

You should see:

```
✅ Server running on http://localhost:3001
WAL mode enabled for better concurrent access
```

### 3. Expose Your Server with Ngrok

In a **separate terminal window**, run:

```bash
ngrok http 3001
```

You'll see output like this:

```
Session Status                online
Forwarding                    https://abc123.ngrok.io -> http://localhost:3001
```

**Copy the https URL** (e.g., `https://abc123.ngrok.io`) - this is your public API URL!

### 4. Update Your Frontend to Use the Ngrok URL

You need to update your React app to use the ngrok URL for API calls. Look for API calls in your components (typically in `Game.jsx`, `Create.jsx`, `Home.jsx`, `Login.jsx`) and update the base URL.

Example:

```javascript
// Before
const API_BASE_URL = "http://localhost:3001/api";

// After (use your actual ngrok URL)
const API_BASE_URL = "https://abc123.ngrok.io/api";
```

### 5. Rebuild and Deploy Your Frontend

After updating the API URLs:

```bash
npm run build
npm run deploy
```

This updates your GitHub Pages site with the new ngrok URL.

## Important Notes

### Database Fixes Applied

✅ **Fixed SQLITE_READONLY error**: Updated `database.js` to properly open the database in read/write mode
✅ **Enabled WAL mode**: Better support for concurrent access from multiple users
✅ **Set proper permissions**: Database file and directory have correct read/write permissions

### Ngrok Considerations

**Free Tier Limitations:**

- Your ngrok URL changes every time you restart ngrok
- Sessions expire after a few hours
- When the URL changes, you must update your frontend and redeploy

**Solutions:**

1. **Ngrok Paid Plan**: Get a permanent URL that doesn't change
2. **Use Environment Variables**: Store API URL in environment variable for easier updates

### For Production (Better Alternatives)

While ngrok works for testing, for a real production app, consider:

1. **Deploy backend to a proper hosting service**:

   - Heroku (free tier available)
   - Railway (free tier available)
   - Render (free tier available)
   - AWS/Google Cloud/Azure

2. **Use a proper database**:

   - PostgreSQL (more suitable for multiple users)
   - MySQL/MariaDB
   - Cloud database services

3. **Advantages**:
   - Permanent URL (no changes needed)
   - Better performance
   - Better security
   - No local machine dependencies

## Testing with Multiple Users

Once everything is set up:

1. Keep your server running (`npm run server`)
2. Keep ngrok running (`ngrok http 3001`)
3. Share your GitHub Pages URL with others
4. All users can now access the app and interact with the same database

## Troubleshooting

### Error: SQLITE_READONLY

**Fixed!** This was caused by opening the database in readonly mode. The fix is now applied.

### Error: Database not found

Run `npm run setup-db` to create the database.

### Error: CORS issues

The server already has CORS enabled in `index.js`, so this should work automatically.

### Ngrok URL changed

1. Get the new ngrok URL
2. Update your frontend code
3. Run `npm run build && npm run deploy`

### Multiple users getting conflicts

The WAL mode is now enabled, which handles concurrent access much better. If you still have issues, consider:

- Moving to PostgreSQL for a production app
- Implementing proper request queuing
- Adding database connection pooling

## Quick Start Checklist

- [ ] Run `npm run setup-db` (one time only)
- [ ] Start server: `npm run server`
- [ ] Start ngrok: `ngrok http 3001`
- [ ] Copy ngrok URL
- [ ] Update frontend API calls with ngrok URL
- [ ] Deploy: `npm run build && npm run deploy`
- [ ] Share GitHub Pages URL with users

## Need Help?

If you encounter issues:

1. Check that both server and ngrok are running
2. Verify the ngrok URL is correct in your frontend
3. Check browser console for error messages
4. Check server terminal for error logs
