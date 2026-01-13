import { supabase } from '@/integrations/supabase/client';

const DEFAULT_SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'public';
const BIKES_IMAGES_PATH = 'bikes/images';

// Upload bike image using server-side endpoint (service role) if available, otherwise use Supabase client
export const uploadBikeImage = async (file: File, bikeId: string): Promise<string> => {
  console.log("Starting image upload for bike:", bikeId, "File:", file.name);
  const timestamp = Date.now();
  const fileName = `${bikeId}_${timestamp}_${file.name}`;
  const path = `bikes/${fileName}`;
  const bucket = DEFAULT_SUPABASE_BUCKET;

  console.log("Upload path:", path, "Bucket:", bucket);

  // Try server-side upload first
  const serverUploadUrl = import.meta.env.VITE_SERVER_UPLOAD_URL || 'http://localhost:3001/upload';
  console.log("Trying server upload at:", serverUploadUrl);
  try {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('path', path);

    try {
      const resp = await fetch(serverUploadUrl, { method: 'POST', body: form });
      if (resp.ok) {
        const json = await resp.json();
        console.debug('Server-side upload succeeded', json);
        return json.publicUrl || json.url || json.public_url || '';
      }
      let bodyText = '';
      try { bodyText = await resp.text(); } catch { bodyText = '<unable to read body>'; }
      console.debug('Server-side upload returned non-OK:', resp.status, bodyText);
    } catch (serverErr) {
      console.debug('Server-side upload not available or failed:', serverErr);
    }
  } catch (e) {
    console.debug('Server upload attempt error:', e);
  }

  // Fallback to client-side Supabase upload
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path) as any;
    const publicUrl = publicData?.publicUrl || `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
    console.debug('Uploaded image to Supabase', { bucket, path, publicUrl, data });
    return publicUrl;
  } catch (err) {
    console.error('uploadBikeImage failed:', err);
    throw err;
  }
};

// Delete bike image from Supabase
export const deleteBikeImage = async (imageUrl: string): Promise<void> => {
  try {
    const bucket = DEFAULT_SUPABASE_BUCKET;
    const supabasePattern = `/storage/v1/object/public/${bucket}/`;
    if (imageUrl.includes(supabasePattern)) {
      const path = imageUrl.split(supabasePattern)[1];
      if (path) {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) console.error('Supabase remove error:', error);
        return;
      }
    }

    // If URL isn't a Supabase public URL, attempt to extract a path and try removing anyway
    try {
      const url = new URL(imageUrl);
      // If path contains /object/public/<bucket>/<path>, extract accordingly
      const idx = url.pathname.indexOf(`/storage/v1/object/public/${bucket}/`);
      if (idx !== -1) {
        const p = decodeURIComponent(url.pathname.split(`/storage/v1/object/public/${bucket}/`)[1]);
        const { error } = await supabase.storage.from(bucket).remove([p]);
        if (error) console.error('Supabase remove error:', error);
        return;
      }
    } catch (err) {
      console.warn('Could not parse image URL for deletion:', err);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
