import { supabase } from '@/integrations/supabase/client';

const DEFAULT_SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'images';
const BIKES_IMAGES_PATH = 'bikes/images';

// Simple Supabase-only upload (no server, no policies needed)
export const uploadBikeImage = async (file: File, bikeId: string): Promise<string> => {
  console.log("Starting simple Supabase upload for bike:", bikeId, "File:", file.name);
  const timestamp = Date.now();
  const fileName = `${bikeId}_${timestamp}_${file.name}`;
  const path = `bikes/${fileName}`;
  const bucket = DEFAULT_SUPABASE_BUCKET;

  console.log("Upload path:", path, "Bucket:", bucket);

  // Direct upload to Supabase with upsert (overwrite if exists)
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting
      contentType: file.type
    });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // Try to create bucket if it doesn't exist
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        console.log('Bucket might not exist, trying to create it...');
        
        // Try a different approach - use public bucket
        try {
          const { data: publicData } = supabase.storage.from('public').upload(path, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type
          });
          
          if (publicData) {
            const { data: publicUrlData } = supabase.storage.from('public').getPublicUrl(path) as any;
            const publicUrl = publicUrlData?.publicUrl || `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
            console.log('Successfully uploaded to public bucket:', publicUrl);
            return publicUrl;
          }
        } catch (publicError) {
          console.error('Public bucket upload also failed:', publicError);
          throw new Error(`Upload failed. Please create bucket '${bucket}' in Supabase dashboard and make it public.`);
        }
      }
      
      throw error;
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path) as any;
    const publicUrl = publicData?.publicUrl || `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
    console.log('Successfully uploaded to Supabase:', { bucket, path, publicUrl });
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
