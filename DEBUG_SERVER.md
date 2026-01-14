# DEBUG SERVER ISSUES

## Quick Debug Steps:

### 1. Test Server Directly
```bash
# Test if server is running
curl http://localhost:3001/buckets

# Test upload with curl
curl -X POST -F "file=@test.jpg" -F "path=bikes/test.jpg" http://localhost:3001/upload
```

### 2. Check Server Console
Look for these messages in server terminal:
```
Supabase upload server listening on http://localhost:3001
Using bucket: images
Uploading to bucket: images
File path: bikes/test.jpg
Bucket created successfully: images
Upload successful: { publicUrl: '...', bucket: 'images' }
```

### 3. Check Client Console
Look for these messages in browser console:
```
Trying server upload at: http://localhost:3001/upload
Server-side upload succeeded { publicUrl: '...' }
```

### 4. Common Issues & Solutions

#### Issue A: Server not accessible from client
**Symptoms**: 
- Server runs locally but client can't connect
- Error: "Server-side upload not available or failed"

**Solutions**:
1. **Check CORS**: Server has `cors({ origin: true })` - should work
2. **Check URL**: Client is trying `http://localhost:3001/upload`
3. **Check firewall**: Port 3001 might be blocked
4. **Use IP**: Try `http://127.0.0.1:3001/upload`

#### Issue B: Server can't create bucket
**Symptoms**:
- Server console: "Failed to create bucket"
- Error: Permission denied

**Solutions**:
1. **Check service role key**: Ensure it has storage permissions
2. **Regenerate key**: Create new service role key with storage permissions
3. **Check bucket name**: Ensure 'images' is correct

#### Issue C: Server upload fails
**Symptoms**:
- Server console: "Supabase admin upload error"
- Upload fails at server level

**Solutions**:
1. **Check service role key permissions**
2. **Check file size**: Ensure file < 50MB
3. **Check MIME type**: Ensure it's an image

### 5. Alternative: Use Different Port
If port 3001 is blocked, change to 3002:

**server/.env**:
```bash
PORT=3002
```

**Client update**:
```javascript
const serverUploadUrl = 'http://localhost:3002/upload';
```

### 6. Force Client to Use Server
If client is still using fallback, update environment:

**.env**:
```bash
VITE_SERVER_UPLOAD_URL=http://localhost:3001/upload
```

### 7. Test with Simple Image
Create a small test image (1KB) and try uploading it.

### 8. Check Network Tab
In browser F12 → Network tab:
1. Upload an image
2. Look for the request to `/upload`
3. Check response status and body

## Expected Working Flow:
1. **Server starts**: "Supabase upload server listening on http://localhost:3001"
2. **Client uploads**: "Trying server upload at: http://localhost:3001/upload"
3. **Server processes**: "Uploading to bucket: images"
4. **Success**: "Server-side upload succeeded { publicUrl: '...' }"
5. **Client receives**: Image URL and saves to Firebase

If any step fails, check the corresponding section above!
