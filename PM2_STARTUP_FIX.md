# PM2 STARTUP FIX - Correct Startup Process

## Problem: PM2 Startup File Not Found

```
[PM2][ERROR] File C:\Users\USER\.pm2\startup.json not found
```

## SOLUTION: Correct PM2 Startup Setup

### Step 1: Install PM2 Startup Script (Correct Way)

```powershell
# Run PowerShell as Administrator
pm2 startup
```

**Expected Output:**
```
[PM2] Init System found: Windows
[PM2] To setup the Startup Script, copy/paste the following command:
```

### Step 2: Copy and Run the Command PM2 Gives You

PM2 will give you a specific command like:
```powershell
pm2 start C:\Users\USER\.pm2\startup.json
```

**Run the exact command PM2 shows you!**

### Step 3: Alternative - Force PM2 Startup

If the above doesn't work, try:

```powershell
# Run as Administrator
pm2 startup windows-uac
```

### Step 4: Save Current Processes First

```powershell
cd server
pm2 start index.js --name "upload-server" --max-memory-restart 200M
pm2 save
pm2 startup
```

### Step 5: Verify PM2 Startup Configuration

```powershell
pm2 startup list
```

Should show your startup configuration.

### Step 6: Test Server Persistence

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

### Step 7: Test Upload After Closing Everything

1. **Close all terminals**
2. **Wait 30 seconds**
3. **Open browser**: https://psrental.lovable.app/admin
4. **Upload image**: Should work
5. **Check console**: Should show server upload

## Alternative: Manual Windows Startup

If PM2 startup continues to fail:

### Option A: Add to Windows Startup Folder

1. **Press Win + R**
2. **Type**: `shell:startup`
3. **Create batch file**: `start-upload-server.bat`
4. **Add content**:
```batch
@echo off
cd /d "C:\Users\USER\Desktop\rent-right\server"
pm2 start index.js --name "upload-server"
```

### Option B: Task Scheduler

1. **Open Task Scheduler**
2. **Create Basic Task**
3. **Name**: "Upload Server"
4. **Trigger**: "When computer starts"
5. **Action**: Start program
6. **Program**: `C:\Users\USER\AppData\Roaming\npm\pm2.cmd`
7. **Arguments**: `start index.js --name "upload-server"`
8. **Start in**: `C:\Users\USER\Desktop\rent-right\server`

## Expected Results:

### PM2 Startup Success:
```
[PM2] Startup script successfully added
[PM2] System startup information saved
```

### Server Always Running:
```
┌────┬──────────────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name             │ mode     │ status   │ cpu      │ memory   │
├────┼──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ upload-server    │ fork     │ online   │ 0%       │ 50mb     │
└────┴──────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Upload Works After Closing Everything:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://...' }
```

## Troubleshooting:

### If PM2 Startup Still Fails:
1. Run PowerShell as Administrator
2. Use `pm2 startup windows-uac`
3. Try manual Windows startup folder

### If Server Still Stops:
1. Check Windows Services
2. Create Task Scheduler job
3. Use batch file in startup folder

### If Upload Still Shows RLS Error:
1. Verify server is running: `pm2 status`
2. Test server: `curl http://localhost:3001/buckets`
3. Clear browser cache

## Final Solution:

The key is using the **exact command PM2 gives you** during startup setup. Don't try to guess the path - let PM2 generate it for you.

This should make your server run permanently!
