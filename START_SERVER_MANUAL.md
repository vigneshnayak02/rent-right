# START SERVER MANUAL - Fix Server Not Running

## Problem: Server Not Running

```
curl : Unable to connect to the remote server
```

This means:
- Server is not running on port 3001
- Startup file might not be working
- Need to start server manually

## SOLUTION: Start Server Manually

### Step 1: Check if Server Process is Running

```powershell
# Check for Node processes
tasklist | findstr node

# Check if port 3001 is in use
netstat -ano | findstr :3001
```

### Step 2: Start Server Manually

```powershell
cd server
node index.js
```

**Expected Output:**
```
Supabase upload server listening on http://localhost:3001
Using bucket: images
Debug buckets at: http://localhost:3001/buckets
```

### Step 3: Keep Server Running

**Keep this terminal window open** - server runs in foreground.

### Step 4: Test Server

In a NEW PowerShell window:
```powershell
curl http://localhost:3001/buckets
```

Should return:
```
{"buckets": [...], "currentBucket": "images"}
```

### Step 5: Test Upload

1. **Keep server running** (don't close the terminal)
2. **Go to**: https://psrental.lovable.app/admin
3. **Upload image**: Should work now
4. **Check console**: Should show server upload success

### Step 6: Fix Startup File (If Needed)

If startup file isn't working:

#### Check Startup File Location:
1. **Win + R** → `shell:startup`
2. **Look for**: `start-upload-server.bat`
3. **Double-click**: Should start server

#### Test Startup File:
1. **Double-click** the batch file
2. **Check if server starts**: Look for Node process
3. **Test server**: `curl http://localhost:3001/buckets`

## Expected Results:

### ✅ Server Running:
```
Supabase upload server listening on http://localhost:3001
Using bucket: images
```

### ✅ Server Test:
```
curl http://localhost:3001/buckets
# Returns bucket list
```

### ✅ Upload Success:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://...' }
```

## Troubleshooting:

### If Server Won't Start:
1. **Check server/.env**: Ensure it has correct values
2. **Check Node.js**: `node --version`
3. **Check dependencies**: `cd server && npm install`
4. **Check port**: Another program might be using 3001

### If Startup File Doesn't Work:
1. **Check file location**: Should be in startup folder
2. **Check file content**: Should have correct paths
3. **Run manually**: Double-click to test
4. **Use Task Scheduler**: More reliable method

### If Upload Still Fails:
1. **Keep server terminal open**: Don't close it
2. **Test server**: `curl http://localhost:3001/buckets`
3. **Check browser console**: Should show server upload
4. **Clear browser cache**: Ctrl+F5

## Quick Fix Sequence:

1. **Start server manually**: `cd server && node index.js`
2. **Keep terminal open**: Server runs in foreground
3. **Test server**: `curl http://localhost:3001/buckets`
4. **Test upload**: Go to admin panel and upload
5. **Verify success**: Check console for server upload message

This should get your upload system working immediately!
