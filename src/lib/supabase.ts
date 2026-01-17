// Storage bucket name
export const BUCKET_NAME = "bird-photos";

/**
 * Upload a file to Supabase Storage using native fetch API
 * This avoids potential bundling issues with the Supabase SDK
 */
export async function uploadToStorage(
  buffer: Buffer,
  path: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
  }

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${path}`;

  // Convert Buffer to Uint8Array for fetch compatibility
  const uint8Array = new Uint8Array(buffer);

  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: uint8Array,
    });
  } catch (fetchError) {
    const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
    const errorStack = fetchError instanceof Error ? fetchError.stack : '';
    throw new Error(`Fetch failed to ${uploadUrl}: ${errorMessage} | Stack: ${errorStack}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase returned error: ${response.status} ${errorText}`);
  }

  // Return public URL
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}

/**
 * Delete a file from Supabase Storage using native fetch API
 */
export async function deleteFromStorage(path: string): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
    return;
  }

  const deleteUrl = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${path}`;

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to delete from Supabase: ${response.status} ${errorText}`);
  }
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(path: string): string {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return `/storage/${path}`;
  }
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}
