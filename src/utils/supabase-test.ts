// Supabase Connection Diagnostic Tool
import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  console.log('🔍 Starting Supabase Connection Test...');
  
  const results = {
    connection: false,
    auth: false,
    buckets: [],
    bucketExists: false,
    errors: []
  };

  try {
    // Test 1: Basic Connection (try a simple operation)
    console.log('📡 Testing basic connection...');
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        results.errors.push(`Auth Error: ${authError.message}`);
      } else {
        results.connection = true;
        results.auth = true;
        console.log('✅ Basic connection successful');
        console.log('🔐 Auth status:', authData.session ? 'Authenticated' : 'Not authenticated');
      }
    } catch (e) {
      results.errors.push(`Connection Exception: ${e}`);
    }

    // Test 2: List Buckets
    console.log('📦 Testing bucket access...');
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        results.errors.push(`Bucket List Error: ${bucketError.message}`);
      } else {
        results.buckets = buckets?.map(b => b.name) || [];
        console.log('✅ Available buckets:', results.buckets);
      }
    } catch (e) {
      results.errors.push(`Bucket Exception: ${e}`);
    }

    // Test 3: Check Specific Bucket
    const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || 'rent-right-images';
    results.bucketExists = results.buckets.includes(bucketName);
    console.log(`🎯 Bucket "${bucketName}" exists:`, results.bucketExists);

    // Test 4: Test Upload Permission
    if (results.bucketExists) {
      console.log('📤 Testing upload permission...');
      try {
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const testPath = `test/${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(testPath, testFile, {
            contentType: 'text/plain',
            upsert: true
          });

        if (uploadError) {
          results.errors.push(`Upload Test Error: ${uploadError.message}`);
        } else {
          console.log('✅ Upload test successful');
          
          // Clean up test file
          await supabase.storage.from(bucketName).remove([testPath]);
        }
      } catch (e) {
        results.errors.push(`Upload Exception: ${e}`);
      }
    }

    // Test 5: Check Environment Variables
    console.log('🌍 Checking environment variables...');
    const envVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '***SET***' : '***MISSING***',
      VITE_SUPABASE_BUCKET: import.meta.env.VITE_SUPABASE_BUCKET
    };
    console.log('📋 Environment Variables:', envVars);

  } catch (e) {
    results.errors.push(`General Exception: ${e}`);
  }

  console.log('📊 Test Results:', results);
  return results;
};

// Run this in browser console to diagnose issues
// testSupabaseConnection();
