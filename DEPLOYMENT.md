# Live Deployment Setup Guide

## Issue: Image Upload Not Working on Live Site

Your live site at https://psrental.lovable.app/admin is failing because:
1. The upload server (localhost:3001) doesn't exist on production
2. The Supabase bucket may not exist or have proper permissions

## Solution: Direct Supabase Upload

### Step 1: Create Supabase Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/btslpgvgctaxneplrzic
2. Navigate to **Storage** section
3. Click **Create Bucket**
4. Enter bucket name: `psbike-images`
5. Make it **Public**
6. Set up policies:
   - **Public Read**: Allow anyone to read files
   - **Authenticated Upload**: Allow authenticated users to upload

### Step 2: Set Bucket Policy

In Supabase SQL Editor, run:

```sql
-- Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'psbike-images');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'psbike-images' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'psbike-images' AND 
  auth.role() = 'authenticated'
);
```

### Step 3: Environment Variables

Make sure your Lovable deployment has these environment variables:

```bash
VITE_SUPABASE_URL=https://btslpgvgctaxneplrzic.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_BUCKET=psbike-images
VITE_FIREBASE_API_KEY=AIzaSyBIzNV7UYOV5Rsc4WkOvdz_xhJfY0IwNAc
VITE_FIREBASE_AUTH_DOMAIN=ps-rentals.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://ps-rentals-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=ps-rentals
```

### Step 4: Test Upload

1. Deploy the updated code to Lovable
2. Go to https://psrental.lovable.app/admin
3. Try uploading an image
4. Check browser console for any errors

### Step 5: Troubleshooting

If still getting errors:

1. **Check Bucket Exists**: Verify `psbike-images` bucket exists in Supabase
2. **Check Permissions**: Ensure bucket is public and has proper policies
3. **Check Console**: Look for specific error messages in browser console
4. **Check Network**: Verify Supabase URL is accessible

### Common Error Messages

- `"Bucket 'psbike-images' not found"` → Create the bucket in Supabase dashboard
- `"Permission denied"` → Set up proper bucket policies
- `"Network error"` → Check Supabase URL and network connectivity

### Alternative: Use Image URLs

If upload continues to fail, you can:
1. Upload images to a service like Imgur
2. Get the public URL
3. Enter the URL directly in the "Image URL" field in admin panel

## Support

For further issues:
1. Check browser console (F12) for specific errors
2. Verify all environment variables are set in Lovable
3. Ensure Supabase bucket exists and is public
