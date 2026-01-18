# SERVER KEEP ALIVE SOLUTION

## Problem: Server Works Once Then Fails

This happens when:
1. Server stops running after first upload
2. Server crashes due to error
3. Server process gets killed
4. Port conflicts occur

## Solution 1: Keep Server Running

### Start Server with Auto-Restart
```bash
# Install nodemon globally
npm install -g nodemon

# Start server with auto-restart
cd server
nodemon index.js
```

### Or Use PM2 for Production
```bash
# Install PM2
npm install -g pm2

# Start server with PM2
cd server
pm2 start index.js --name "upload-server"

# Check status
pm2 status

# View logs
pm2 logs upload-server

# Stop server
pm2 stop upload-server
```

## Solution 2: Fix Server Issues

### Check Server Logs
Look for these errors in server console:
- "Failed to create bucket"
- "Supabase admin upload error"
- "Bucket creation failed"

### Common Server Fixes

#### Fix A: Increase Timeout
Add this to server/index.js:
```javascript
// Add at the top with other requires
const timeout = require('connect-timeout');

// Add after app.use(cors(...))
app.use(timeout('30s'));
```

#### Fix B: Better Error Handling
Update server upload endpoint to handle errors gracefully.

#### Fix C: Check Environment Variables
Ensure server/.env has correct values:
```bash
SUPABASE_URL=https://keilhtlygcickccfnrpl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Lmt7KCyLheprrRXkgKgJQw_z2umK5jC
SUPABASE_BUCKET=images
PORT=3001
```

## Solution 3: Client-Side Fallback

If server keeps failing, force client-side upload:

### Update .env
```bash
# Disable server upload
VITE_SERVER_UPLOAD_URL=""
```

### Or Update Storage Code
Modify src/integrations/firebase/storage.ts to skip server upload.

## Solution 4: Use Different Storage

If Supabase continues to have issues, switch to:

### Option A: Firebase Storage
```javascript
// Use Firebase for uploads instead of Supabase
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
```

### Option B: Cloudinary
```javascript
// Use Cloudinary for uploads
import { Cloudinary } from '@cloudinary/url-gen';
```

### Option C: Direct URL Input
Use "Image URL" field instead of file upload.

## Quick Test: Server Health Check

```bash
# Test if server is running
curl http://localhost:3001/buckets

# Test upload
curl -X POST -F "file=@test.jpg" http://localhost:3001/upload
```

## Recommended Approach

1. **Run PERMANENT_FIX.sql** in Supabase SQL Editor
2. **Start server with PM2** for stability
3. **Test upload** - should work consistently
4. **Monitor server logs** for any errors

This should make your uploads work permanently!
