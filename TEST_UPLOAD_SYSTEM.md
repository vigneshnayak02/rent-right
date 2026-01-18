# TEST UPLOAD SYSTEM - Complete Verification

## Setup Complete! Now Test Everything

### Step 1: Test Server is Running

```powershell
# Test if server is accessible
curl http://localhost:3001/buckets

# Check if Node process is running
tasklist | findstr node
```

**Expected Result:**
```
{"buckets": [...], "currentBucket": "images"}
```

### Step 2: Test Upload in Admin Panel

1. **Go to**: https://psrental.lovable.app/admin
2. **Add/Edit Bike**: Click "Add Bike" or edit existing
3. **Choose Image**: Select any image file
4. **Click Upload**: Should work immediately
5. **Check Console**: Press F12 → Console tab

**Expected Console Output:**
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://keilhtlygcickccfnrpl.supabase.co/storage/v1/object/public/images/bikes/...' }
```

### Step 3: Verify Image in Supabase

1. **Go to**: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl
2. **Storage** → **images** bucket
3. **Check**: Image should appear in `bikes/` folder

### Step 4: Test Persistence

1. **Close all terminals**
2. **Wait 30 seconds**
3. **Test server**: `curl http://localhost:3001/buckets`
4. **Test upload**: Try uploading another image
5. **Reboot computer**: Optional - test auto-start

### Expected Results:

### ✅ Server Always Running:
```
curl http://localhost:3001/buckets
# Returns bucket list - server is accessible
```

### ✅ Upload Works Every Time:
```
Starting image upload for bike: bike123 File: image.jpg
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: 'https://...' }
```

### ✅ No More RLS Errors:
- No "new row violates row-level security policy"
- No "bucket not found" errors
- No "permission denied" errors

### ✅ Images Appear in Supabase:
- Images stored in `images/bikes/` folder
- Public URLs work correctly
- Images display in admin panel

## Troubleshooting:

### If Server Test Fails:
```powershell
# Check if server is running
pm2 status

# If not running, start it
cd server
node index.js
```

### If Upload Still Shows RLS Error:
1. **Check browser console**: Does it say "Trying server upload"?
2. **Clear browser cache**: Ctrl+F5
3. **Deploy latest changes**: Ensure VITE_SERVER_UPLOAD_URL is set
4. **Test server directly**: `curl http://localhost:3001/buckets`

### If Images Don't Appear in Supabase:
1. **Check server logs**: Look for upload errors
2. **Check bucket**: Ensure "images" bucket exists
3. **Check permissions**: Bucket should be public

## Success Indicators:

### 🎯 Everything Working:
- ✅ Server responds to curl test
- ✅ Upload succeeds in admin panel
- ✅ No RLS errors in console
- ✅ Images appear in Supabase Storage
- ✅ Images display correctly in admin panel

### 🚀 Final Result:

Your image upload system should now work **perfectly and permanently**:
- Server runs 24/7 (startup file)
- Uploads work every time (service role bypasses RLS)
- No more errors (consistent server access)
- Images stored correctly (Supabase Storage)

**Test your upload system now - it should work flawlessly!** 🎉
