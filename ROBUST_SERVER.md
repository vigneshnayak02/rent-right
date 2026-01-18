# ROBUST SERVER SOLUTION - Fix Intermittent Failures

## Problem: Upload Works 2 Times Then Fails

This happens when:
1. Server crashes after few uploads
2. Server process gets killed
3. Memory leaks in server
4. Service role key expires or invalid
5. Port conflicts or connection issues

## SOLUTION: Make Server Bulletproof

### Step 1: Start Server with PM2 (Robust Configuration)

```powershell
cd server
pm2 start index.js --name "upload-server" --max-memory-restart 200M
pm2 save  # Save current process list
pm2 startup  # Auto-start on system boot
pm2 status
```

### Step 2: Monitor Server Health

```powershell
# Check server status
pm2 status

# View real-time logs
pm2 logs upload-server --lines 50

# Monitor resource usage
pm2 monit
```

### Step 3: Test Server Continuously

```powershell
# Test server multiple times
curl http://localhost:3001/buckets
curl http://localhost:3001/buckets
curl http://localhost:3001/buckets
```

### Step 4: Check Server Environment

Verify `server/.env` has correct values:
```bash
SUPABASE_URL=https://keilhtlygcickccfnrpl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Lmt7KCyLheprrRXkgKgJQw_z2umK5jC
SUPABASE_BUCKET=images
PORT=3001
```

### Step 5: Restart Server Fresh

```powershell
# Stop existing server
pm2 stop upload-server
pm2 delete upload-server

# Start fresh with monitoring
pm2 start index.js --name "upload-server" --max-memory-restart 200M --restart-delay 5000
pm2 logs upload-server --lines 20
```

### Step 6: Alternative - Use Node Directly

If PM2 continues to fail, use Node with auto-restart:

```powershell
cd server
node index.js
```

Keep this terminal open - server runs in foreground.

### Step 7: Test Upload Pattern

1. Deploy to Lovable
2. Go to admin panel
3. Upload image #1 - should work
4. Upload image #2 - should work
5. Upload image #3 - should work
6. Check server logs after each upload

## Expected Results:

### PM2 Status:
```
┌────┬──────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name             │ mode     │ status   │ cpu      │ memory   │
├────┼──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ upload-server    │ fork     │ online   │ 0%       │ 50mb     │
└────┴──────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Server Logs:
```
Supabase upload server listening on http://localhost:3001
Using bucket: images
Uploading to bucket: images
Upload successful: { publicUrl: 'https://...', bucket: 'images' }
Uploading to bucket: images
Upload successful: { publicUrl: 'https://...', bucket: 'images' }
```

### Browser Console:
```
Upload #1: Server-side upload succeeded { publicUrl: '...' }
Upload #2: Server-side upload succeeded { publicUrl: '...' }
Upload #3: Server-side upload succeeded { publicUrl: '...' }
```

## Troubleshooting:

### If Server Crashes:
1. Check logs: `pm2 logs upload-server`
2. Check memory: `pm2 monit`
3. Restart server: `pm2 restart upload-server`

### If Upload Fails After 2 Times:
1. Server is crashing - check logs for errors
2. Service role key issue - verify in server/.env
3. Memory leak - restart server between uploads
4. Port conflict - change to 3002

### If RLS Error Returns:
1. Server stopped - client fell back to client upload
2. Check if server is running: `pm2 status`
3. Restart server: `pm2 restart upload-server`
4. Clear browser cache

## Final Solution:

The key is keeping server running consistently:
- PM2 with monitoring and auto-restart
- Memory limits to prevent crashes
- Log monitoring to catch issues
- Backup plan with direct Node execution

This should make uploads work consistently every time!
