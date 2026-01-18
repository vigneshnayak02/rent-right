# FIX PORT CONFLICT & BIKE RENTAL STATUS

## Current Issues:

### 1. Port 3001 Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```

### 2. Bike Rental Status Question
You want: When bike status is changed to "rented" in admin panel, it should also show as rented in main dashboard.

## SOLUTIONS:

### Part 1: Fix Port Conflict

#### Option A: Kill Existing Process
```powershell
# Find and kill Node processes
tasklist | findstr node
taskkill /F /IM node.exe

# Then start server
cd server
node index.js
```

#### Option B: Change Port
Update `server/.env`:
```bash
PORT=3002
```

Update client `.env`:
```bash
VITE_SERVER_UPLOAD_URL=http://localhost:3002/upload
```

#### Option C: Use PM2 to Stop and Restart
```powershell
pm2 stop upload-server
pm2 delete upload-server
cd server
node index.js
```

### Part 2: Fix Bike Rental Status

The issue is that when you change bike status in admin panel, it's not reflecting in the main dashboard.

#### Check Current Implementation:
Look at how bike status is being updated in your Firebase database structure.

#### Expected Flow:
1. Admin changes bike status to "rented"
2. Firebase database updates
3. Main dashboard reads updated status
4. Bike shows as "rented" everywhere

## IMMEDIATE STEPS:

### Step 1: Fix Port Issue
```powershell
# Kill existing Node processes
taskkill /F /IM node.exe

# Start server on new port
cd server
node index.js
```

### Step 2: Test Server
```powershell
curl http://localhost:3001/buckets
```

### Step 3: Test Upload
1. Go to admin panel
2. Upload image - should work
3. Check console for server upload success

### Step 4: Check Bike Status Update
1. Change bike status to "rented" in admin panel
2. Go to main dashboard
3. Check if bike shows as "rented"

## Expected Results:

### Server Running:
```
Supabase upload server listening on http://localhost:3001
Using bucket: images
```

### Upload Working:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://...' }
```

### Bike Status Working:
- Change status in admin panel
- Status updates in Firebase
- Main dashboard shows updated status
- Bike appears as "rented" everywhere

## For Bike Status Issue:

If status changes aren't reflecting:

### Check Firebase Structure:
1. **Admin panel**: Updates bike status
2. **Firebase Realtime Database**: Check if status field exists
3. **Main dashboard**: Check if it's reading from same location

### Common Issues:
1. **Different paths**: Admin and dashboard using different Firebase nodes
2. **Cache issues**: Browser or app cache
3. **Real-time listeners**: Not properly set up
4. **Field names**: Different field names being used

### Debug Steps:
1. **Open Firebase Console**: https://console.firebase.google.com
2. **Check Realtime Database**: Look at bike data structure
3. **Test status change**: Change in admin panel
4. **Watch Firebase**: See if data updates immediately

## Final Solution:

1. **Fix port conflict** first (kill Node processes)
2. **Start server** and test upload
3. **Test bike status** - identify why it's not syncing
4. **Fix Firebase structure** if needed

This should resolve both issues!
