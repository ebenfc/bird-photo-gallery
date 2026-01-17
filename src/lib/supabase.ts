import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Storage bucket name
export const BUCKET_NAME = "bird-photos";

// Lazy-load Supabase client to avoid build-time errors
let supabaseClient: SupabaseClient | null = null;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadToStorage(
  buffer: Buffer,
  path: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  // Return public URL
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromStorage(path: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    console.error(`Failed to delete from Supabase: ${error.message}`);
  }
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(path: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}
