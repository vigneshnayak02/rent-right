import { supabase } from '@/integrations/supabase/client';

const DEFAULT_SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'psbike-images';
const BIKES_IMAGES_PATH = 'bikes/images';

// Upload bike image directly to Supabase (no server required)
export const uploadBikeImage = async (file: File, bikeId: string): Promise<string> => {
  console.log("Starting direct Supabase upload for bike:", bikeId, "File:", file.name);
  const timestamp = Date.now();
  const fileName = `${bikeId}_${timestamp}_${file.name}`;
  const path = `bikes/${fileName}`;
  const bucket = DEFAULT_SUPABASE_BUCKET;

  console.log("Upload path:", path, "Bucket:", bucket);

  // Try to create bucket first if it doesn't exist
  let availableBuckets: string[] = [];
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    availableBuckets = buckets?.map(b => b.name) || [];
    const bucketExists = availableBuckets.includes(bucket);
    
    console.log('Available buckets:', availableBuckets);
    console.log('Target bucket:', bucket);
    console.log('Bucket exists:', bucketExists);
    
    if (!bucketExists) {
      console.log('Bucket does not exist, cannot create with client key:', bucket);
      // For production, we'll need to handle this differently
      // For now, try to upload anyway
    }
  } catch (bucketError) {
    console.log('Cannot check bucket with client key, continuing with upload');
    console.log('Bucket check error:', bucketError);
  }

  // Direct upload to Supabase
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting for production
      contentType: file.type
    });

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // If bucket doesn't exist, provide helpful error
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        throw new Error(`Bucket '${bucket}' not found. Please create the bucket in Supabase dashboard and make it public. Available buckets: ${availableBuckets.join(', ') || 'none'}`);
      }
      
      // If permission error, provide guidance
      if (error.message?.includes('permission') || error.message?.includes('denied')) {
        throw new Error(`Permission denied for bucket '${bucket}'. Please check bucket policies and ensure public access is enabled.`);
      }
      
      // If RLS error, provide guidance
      if (error.message?.includes('RLS') || error.message?.includes('row level security')) {
        throw new Error(`Row Level Security policy error for bucket '${bucket}'. Please check storage policies in Supabase dashboard.`);
      }
      
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
