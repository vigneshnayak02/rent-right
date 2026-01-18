# WINDOWS SETUP GUIDE - PowerShell Commands

## Problem: PowerShell Commands Not Working

You're trying to run commands in PowerShell but they need different syntax for Windows.

## SOLUTION:

### Step 1: Environment Variables Fixed ✅
I've added `VITE_SERVER_UPLOAD_URL=http://localhost:3001/upload` to your `.env` file.

### Step 2: Install PM2 (Windows PowerShell)
```powershell
# Install PM2 globally
npm install -g pm2

# Or if npm doesn't work, try:
npm install -g pm2 --force
```

### Step 3: Start Server (Windows PowerShell)
```powershell
cd server
pm2 start index.js --name "upload-server"
pm2 status
```

### Step 4: Alternative to PM2 (Use Node Directly)
If PM2 doesn't work, use Node directly:
```powershell
cd server
node index.js
```

Keep this terminal window open - server will run in foreground.

### Step 5: Test Server (Windows PowerShell)
```powershell
# Test if server is running
curl http://localhost:3001/buckets

# If curl doesn't work, use PowerShell:
Invoke-WebRequest -Uri "http://localhost:3001/buckets" -UseBasicParsing
```

### Step 6: Deploy and Test
1. Deploy latest changes to Lovable
2. Go to https://psrental.lovable.app/admin
3. Try uploading an image
4. Check browser console (F12)

## Expected Results:

### Server Console:
```
Supabase upload server listening on http://localhost:3001
Using bucket: images
```

### Browser Console:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://...' }
```

## Troubleshooting:

### If PM2 Install Fails:
```powershell
# Try with admin PowerShell (Run as Administrator)
npm install -g pm2
```

### If Server Won't Start:
1. Check server/.env file exists
2. Check Node.js is installed: `node --version`
3. Check dependencies: `cd server && npm install`

### If Upload Still Fails:
1. Check server is running (keep terminal open)
2. Check browser console for errors
3. Clear browser cache (Ctrl+F5)
4. Deploy latest changes to Lovable

## Quick Test Sequence:

1. Install PM2: `npm install -g pm2`
2. Start server: `cd server && pm2 start index.js --name "upload-server"`
3. Check status: `pm2 status`
4. Test upload in admin panel

This should work on Windows!
