# PORT CONFLICT FIX - Server Already Running

## Problem: Port 3001 Already in Use

PM2 shows server is online, but Node.js can't start because port 3001 is already occupied by PM2 process.

## SOLUTION: Use Existing Server

### Step 1: Check PM2 Status (Already Done ✅)
```
│ 0  │ upload-server      │ fork     │ online    │ 0%       │ 0b       │
```

Server is already running! You don't need to start it again.

### Step 2: Test Server (It's Working!)
```powershell
curl http://localhost:3001/buckets
```

If this works, server is ready for uploads.

### Step 3: Deploy and Test Upload
1. Deploy latest changes to Lovable
2. Go to https://psrental.lovable.app/admin
3. Try uploading an image
4. Check browser console (F12)

### Step 4: If Upload Still Fails

The issue is that **client is not using server**. Check browser console:

#### Working Upload Should Show:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://...' }
```

#### RLS Error Means:
```
Client fell back to client-side upload
Server upload failed or not accessible
```

### Step 5: Force Client to Use Server

If client is still falling back, force it:

1. **Clear browser cache**: Ctrl+F5
2. **Deploy latest changes**: Ensure VITE_SERVER_UPLOAD_URL is set
3. **Check .env file**: Verify VITE_SERVER_UPLOAD_URL exists

### Step 6: Alternative - Change Port

If port 3001 has issues, change to 3002:

#### Update server/.env:
```bash
PORT=3002
```

#### Update client .env:
```bash
VITE_SERVER_UPLOAD_URL=http://localhost:3002/upload
```

#### Restart server:
```powershell
pm2 stop upload-server
pm2 delete upload-server
cd server
pm2 start index.js --name "upload-server" --max-memory-restart 200M
```

### Step 7: Test New Port
```powershell
curl http://localhost:3002/buckets
```

## Expected Results:

### Server is Already Running ✅:
- PM2 status shows "online"
- Server is accessible at http://localhost:3001
- No need to start Node.js again

### Upload Should Work ✅:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://keilhtlygcickccfnrpl.supabase.co/storage/v1/object/public/images/bikes/...' }
```

### No More RLS Errors ✅:
- Server handles all uploads
- Service role bypasses RLS
- Client doesn't fall back

## Troubleshooting:

### If curl Fails:
1. Check PM2 status: `pm2 status`
2. Check server logs: `pm2 logs upload-server`
3. Restart PM2: `pm2 restart upload-server`

### If Upload Still Shows RLS Error:
1. Clear browser cache
2. Deploy latest changes
3. Check VITE_SERVER_UPLOAD_URL in .env
4. Verify server is accessible

### If Server Keeps Crashing:
1. Check logs for errors
2. Use port 3002 instead
3. Monitor memory usage

## Final Solution:

Your server is already running! The issue is:
1. ✅ Server is online (PM2 shows online)
2. ❌ Client might not be using server
3. ❌ Browser cache might have old code

**Deploy latest changes and test upload - server is ready!**
