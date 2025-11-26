# Quick Start Guide

## 🚀 Running Your App with Multiple Users

### 1. Start Backend Server

```bash
npm run server
```

### 2. Start Ngrok (in a new terminal)

```bash
ngrok http 3001
```

### 3. Update API URL

Copy your ngrok URL (e.g., `https://abc123.ngrok-free.dev`) and update it in:

```
src/config.js
```

Change this line:

```javascript
export const API_BASE_URL = "https://YOUR-NGROK-URL-HERE/api";
```

### 4. Deploy to GitHub Pages

```bash
npm run build
npm run deploy
```

### 5. Share Your App

Share your GitHub Pages URL with others:

```
https://zbansfield.github.io/bansfield-connections-app
```

## ✅ What's Been Fixed

### SQLITE_READONLY Error - SOLVED! ✓

- Fixed database connection mode in `src/server/database.js`
- Enabled WAL mode for better concurrent access
- Set proper file permissions

### API URL Management - IMPROVED! ✓

- Created centralized config in `src/config.js`
- Updated all components to use the config
- Now you only need to update the URL in ONE place!

## 📁 Files Modified

1. **src/server/database.js** - Fixed database connection and enabled WAL mode
2. **src/config.js** - NEW centralized API configuration
3. **src/components/Login.jsx** - Uses centralized config
4. **src/components/Home.jsx** - Uses centralized config
5. **src/components/Create.jsx** - Uses centralized config
6. **src/components/Game.jsx** - Uses centralized config

## 🔄 When Your Ngrok URL Changes

1. Update `src/config.js` with new URL
2. Run `npm run build && npm run deploy`
3. Wait ~1-2 minutes for GitHub Pages to update

## 💡 Tips

- Keep both terminal windows open (server + ngrok)
- If you get errors, check both terminals for logs
- Make sure database exists: run `npm run setup-db` if needed
- For permanent solution, see `DEPLOYMENT_GUIDE.md`

## 🆘 Common Issues

**Error: Database not found**

```bash
npm run setup-db
```

**Error: Port 3001 in use**

```bash
# Kill the process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Error: Connection refused**

- Make sure server is running (`npm run server`)
- Make sure ngrok is running (`ngrok http 3001`)
- Check that API_BASE_URL in config.js matches your ngrok URL
