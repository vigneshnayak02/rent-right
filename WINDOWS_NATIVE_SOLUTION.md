# WINDOWS NATIVE SOLUTION - Bypass PM2 Issues

## Problem: PM2 Startup Fails on Windows

```
[PM2][ERROR] Init system not found
TypeError: process.getuid is not a function
```

This is a known issue with PM2 on Windows + Node.js v22.

## SOLUTION: Use Windows Native Methods

### Step 1: Create Windows Batch File

Create `server\start-server.bat`:
```batch
@echo off
cd /d "C:\Users\USER\Desktop\rent-right\server"
echo Starting upload server...
node index.js
pause
```

### Step 2: Create Windows Service Script

Create `server\create-service.js`:
```javascript
const { exec } = require('child_process');

// Create Windows Service using sc command
exec('sc create "UploadServer" binPath= "C:\Program Files\nodejs\node.exe" start= auto DisplayName= "Upload Server"', (error, stdout, stderr) => {
  if (error) {
    console.log('Error creating service:', error);
    return;
  }
  console.log('Service created successfully');
  
  // Set service parameters
  exec('sc config "UploadServer" start= auto DisplayName= "Upload Server" binPath= "C:\Program Files\nodejs\node.exe C:\Users\USER\Desktop\rent-right\server\index.js"', (error, stdout, stderr) => {
    if (error) {
      console.log('Error configuring service:', error);
      return;
    }
    console.log('Service configured successfully');
    
    // Start the service
    exec('sc start "UploadServer"', (error, stdout, stderr) => {
      if (error) {
        console.log('Error starting service:', error);
        return;
      }
      console.log('Service started successfully');
    });
  });
});
```

### Step 3: Create Task Scheduler Script

Create `server\create-task.ps1`:
```powershell
# Create scheduled task for server startup
$action = New-ScheduledTaskAction -Execute "node.exe" -Argument "C:\Users\USER\Desktop\rent-right\server\index.js" -WorkingDirectory "C:\Users\USER\Desktop\rent-right\server"
$trigger = New-ScheduledTaskTrigger -AtLogon -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

Register-ScheduledTask -TaskName "UploadServer" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force
Write-Host "Task created successfully"
```

### Step 4: Simple Solution - Task Scheduler GUI

1. **Press Win + R**
2. **Type**: `taskschd.msc`
3. **Click**: "Create Basic Task"
4. **Name**: "Upload Server"
5. **Trigger**: "When I log on"
6. **Action**: "Start a program"
7. **Program**: `C:\Program Files\nodejs\node.exe`
8. **Arguments**: `C:\Users\USER\Desktop\rent-right\server\index.js`
9. **Start in**: `C:\Users\USER\Desktop\rent-right\server`
10. **Check**: "Run with highest privileges"
11. **Click**: Finish

### Step 5: Alternative - Startup Folder

1. **Press Win + R**
2. **Type**: `shell:startup`
3. **Create**: `start-upload-server.bat`
4. **Content**:
```batch
@echo off
cd /d "C:\Users\USER\Desktop\rent-right\server"
start /B node index.js
```

### Step 6: Test Server Persistence

1. **Start server**: Use any method above
2. **Close all terminals**
3. **Wait 30 seconds**
4. **Test server**: `curl http://localhost:3001/buckets`
5. **Test upload**: Go to admin panel

### Step 7: Keep Server Running (Simple Method)

Just keep the server running in a dedicated terminal:
```powershell
cd server
node index.js
```

Keep this terminal minimized - server runs continuously.

## Expected Results:

### Server Running:
```
Supabase upload server listening on http://localhost:3001
Using bucket: images
```

### Upload Works:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://...' }
```

### No More RLS Errors:
- Server always accessible
- Service role bypasses RLS
- Uploads work consistently

## Troubleshooting:

### If Task Scheduler Fails:
1. Run Task Scheduler as Administrator
2. Check "Task Scheduler Library"
3. Look for "UploadServer" task
4. Right-click → Run

### If Service Creation Fails:
1. Run PowerShell as Administrator
2. Check Node.js installation path
3. Use Task Scheduler instead

### If Server Still Stops:
1. Use dedicated terminal method
2. Keep terminal minimized
3. Check Windows Event Viewer for errors

## Final Solution:

Since PM2 has Windows compatibility issues, use:
- **Task Scheduler**: Most reliable Windows method
- **Startup folder**: Simple and effective
- **Dedicated terminal**: Works immediately

This bypasses all PM2 Windows issues!
