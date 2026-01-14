require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'psbike-images';
const PORT = parseInt(process.env.PORT || '3001', 10);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. See .env.example');
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

const app = express();
app.use(cors({ origin: true }));

const upload = multer({ storage: multer.memoryStorage() });

// POST /upload
// form-data: file (binary), path (optional; e.g., bikes/<filename>)
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file = req.file;
    const userPath = req.body.path || `bikes/${Date.now()}_${file.originalname}`;

    console.log('Uploading to bucket:', SUPABASE_BUCKET);
    console.log('File path:', userPath);

    // Check if bucket exists, create if it doesn't
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = buckets.some(bucket => bucket.name === SUPABASE_BUCKET);
      
      if (!bucketExists) {
        console.log('Bucket does not exist, creating:', SUPABASE_BUCKET);
        const { error: createError } = await supabaseAdmin.storage.createBucket(SUPABASE_BUCKET, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/*']
        });
        
        if (createError) {
          console.error('Failed to create bucket:', createError);
          return res.status(500).json({ error: `Bucket creation failed: ${createError.message}` });
        }
        console.log('Bucket created successfully:', SUPABASE_BUCKET);
      }
    } catch (bucketError) {
      console.error('Bucket check error:', bucketError);
      // Continue with upload attempt even if bucket check fails
    }

    const { data, error } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).upload(userPath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      console.error('Supabase admin upload error:', error);
      return res.status(500).json({ 
        error: error.message || error,
        bucket: SUPABASE_BUCKET,
        path: userPath
      });
    }

    const { data: publicData } = supabaseAdmin.storage.from(SUPABASE_BUCKET).getPublicUrl(userPath);
    const publicUrl = publicData?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodeURIComponent(userPath)}`;

    console.log('Upload successful:', { publicUrl, bucket: SUPABASE_BUCKET });

    return res.json({ 
      publicUrl, 
      path: userPath, 
      bucket: SUPABASE_BUCKET,
      raw: data 
    });
  } catch (err) {
    console.error('Upload endpoint error:', err);
    return res.status(500).json({ 
      error: String(err),
      bucket: SUPABASE_BUCKET
    });
  }
});

// GET /buckets - list all buckets (for debugging)
app.get('/buckets', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ 
      buckets: data,
      currentBucket: SUPABASE_BUCKET 
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Supabase upload server listening on http://localhost:${PORT}`);
  console.log(`Using bucket: ${SUPABASE_BUCKET}`);
  console.log(`Debug buckets at: http://localhost:${PORT}/buckets`);
});
