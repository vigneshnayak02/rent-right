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

    const { data, error } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).upload(userPath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      console.error('Supabase admin upload error:', error);
      return res.status(500).json({ error: error.message || error });
    }

    const { data: publicData } = supabaseAdmin.storage.from(SUPABASE_BUCKET).getPublicUrl(userPath);
    const publicUrl = publicData?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodeURIComponent(userPath)}`;

    return res.json({ publicUrl, path: userPath, raw: data });
  } catch (err) {
    console.error('Upload endpoint error:', err);
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Supabase upload server listening on http://localhost:${PORT}`);
});
