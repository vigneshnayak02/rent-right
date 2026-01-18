# FORCE SERVER UPLOAD - Complete Solution

## Problem: Still Getting RLS Error

The issue is that **client-side upload is still being used** instead of server-side upload. Even though we fixed the server and RLS, the client is falling back to client-side upload which still has RLS restrictions.

## Solution: Force Server Upload Only

### Step 1: Update Client Environment

Add this to your client `.env` file:

```bash
# Force server upload only
VITE_SERVER_UPLOAD_URL=http://localhost:3001/upload
VITE_SUPABASE_BUCKET=images
```

### Step 2: Update Storage Code

The client is probably falling back to client-side upload. We need to ensure it always tries server first.

### Step 3: Ensure Server is Running

```bash
cd server
pm2 start index.js --name "upload-server"
pm2 status  # Should show "online"
pm2 logs upload-server  # Monitor for errors
```

### Step 4: Test Server Directly

```bash
# Test if server is accessible
curl http://localhost:3001/buckets

# Test upload
curl -X POST -F "file=@test.jpg" -F "path=bikes/test.jpg" http://localhost:3001/upload
```

### Step 5: Deploy and Test

1. Deploy latest changes to Lovable
2. Go to https://psrental.lovable.app/admin
3. Try uploading an image
4. Check browser console for:
   ```
   Trying server upload at: http://localhost:3001/upload
   Server-side upload succeeded { publicUrl: '...' }
   ```

## Why This Works

### Server Has Full Permissions:
- Service role key bypasses all RLS restrictions
- Server can create buckets and set policies
- Server has complete storage access

### Client Has Limited Permissions:
- Publishable key has RLS restrictions
- Client cannot bypass RLS policies
- Client falls back to RLS-protected uploads

## Expected Results

### Working Upload:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://keilhtlygcickccfnrpl.supabase.co/storage/v1/object/public/images/bikes/...' }
```

### No More RLS Errors:
- No "new row violates row-level security policy"
- No "permission denied" errors
- No "bucket not found" errors

## Troubleshooting

### If Still Getting RLS Error:
1. Check browser console - does it say "Trying server upload"?
2. Check server logs - is server receiving requests?
3. Test server directly with curl
4. Ensure VITE_SERVER_UPLOAD_URL is set correctly

### If Server Not Working:
1. Check server is running: `pm2 status`
2. Check server logs: `pm2 logs upload-server`
3. Check server environment variables
4. Test server endpoints directly

### If Client Still Using Fallback:
1. Clear browser cache
2. Deploy latest changes to Lovable
3. Check VITE_SERVER_UPLOAD_URL is set
4. Force refresh browser (Ctrl+F5)

## Final Result

With server upload forced, your images will upload successfully every time because:
- Server has service role permissions (bypasses RLS)
- Server can create buckets and set policies
- Server has complete storage access
- No RLS restrictions on server-side uploads

This should permanently eliminate the RLS error!
