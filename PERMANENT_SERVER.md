# PERMANENT SERVER SOLUTION - Keep Server Running Always

## Problem: Server Stops When Terminal Closed

When you close everything:
1. PM2 process stops
2. Server becomes inaccessible
3. Client falls back to client-side upload
4. RLS error returns

## SOLUTION: Make Server Permanent

### Step 1: Setup PM2 for System Startup

```powershell
cd server
pm2 start index.js --name "upload-server" --max-memory-restart 200M
pm2 save  # Save current process list
pm2 startup  # Auto-start on system boot
pm2 status
```

### Step 2: Verify PM2 Startup Service

```powershell
# Check if PM2 startup is configured
pm2 startup list

# Should show something like:
# [PM2] Init System found: Windows
# [PM2] To setup the Startup Script, copy/paste the following command:
# pm2 start C:\Users\USER\.pm2\startup.json
```

### Step 3: Enable PM2 Startup (Run as Administrator)

```powershell
# Run PowerShell as Administrator
pm2 start C:\Users\USER\.pm2\startup.json
```

### Step 4: Test Server Persistence

```powershell
# Close all terminals
# Wait 10 seconds
# Open new terminal
pm2 status
```

Should still show:
```
│ 0  │ upload-server      │ fork     │ online    │ 0%       │ 0b       │
```

### Step 5: Test Server After Reboot

1. **Reboot computer**
2. **Open PowerShell**
3. **Check status**: `pm2 status`
4. **Test server**: `curl http://localhost:3001/buckets`

### Step 6: Alternative - Windows Service

If PM2 startup doesn't work, create Windows Service:

```powershell
# Install node-windows
npm install -g node-windows

# Create Windows Service script
cd server
node create-service.js
```

### Step 7: Create Service Script

Create `server/create-service.js`:
```javascript
var Service = require('node-windows').Service;

var svc = new Service({
  name: 'Upload Server',
  description: 'Supabase Upload Server',
  script: 'C:\\Users\\USER\\Desktop\\rent-right\\server\\index.js',
  nodeOptions: ['--harmony'],
  workingDirectory: 'C:\\Users\\USER\\Desktop\\rent-right\\server',
  env: [{
    name: "NODE_ENV",
    value: "production"
  }]
});

svc.on('install', function(){
  svc.start();
});

svc.install();
```

### Step 8: Install Windows Service

```powershell
cd server
node create-service.js
```

### Step 9: Test Upload After Closing Everything

1. **Close all terminals**
2. **Wait 30 seconds**
3. **Open browser**: https://psrental.lovable.app/admin
4. **Upload image**: Should work
5. **Check console**: Should show server upload

## Expected Results:

### PM2 Status (Always Online):
```
┌────┬──────────────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name             │ mode     │ status   │ cpu      │ memory   │
├────┼──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ upload-server    │ fork     │ online   │ 0%       │ 50mb     │
└────┴──────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Upload Works (Even After Closing Everything):
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://...' }
```

### No More RLS Errors:
- Server always running
- Client always uses server
- Service role bypasses RLS
- Uploads work consistently

## Troubleshooting:

### If PM2 Startup Fails:
1. Run PowerShell as Administrator
2. Check Windows startup folder
3. Manually add PM2 to Windows startup

### If Service Doesn't Start:
1. Check Windows Services (services.msc)
2. Look for "Upload Server"
3. Start service manually

### If Upload Still Fails:
1. Check server is running: `pm2 status`
2. Test server: `curl http://localhost:3001/buckets`
3. Clear browser cache

## Final Result:

With permanent server setup:
- Server runs 24/7
- Uploads work anytime
- No RLS errors ever
- Works even after reboots

This makes your upload system bulletproof!
