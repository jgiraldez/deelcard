import { createClient } from '@/lib/supabase/server'

const AVATARS_BUCKET = 'avatars'
const RECEIPTS_BUCKET = 'receipts'

/**
 * Upload an avatar image
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ url: string; path: string }> {
  const supabase = await createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

/**
 * Delete an avatar image
 */
export async function deleteAvatar(path: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([path])

  if (error) {
    throw new Error(`Failed to delete avatar: ${error.message}`)
  }
}

/**
 * Upload a receipt/purchase proof image
 */
export async function uploadReceipt(
  file: File,
  kidId: string,
  transactionId: string
): Promise<{ url: string; path: string }> {
  const supabase = await createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${transactionId}-${Date.now()}.${fileExt}`
  const filePath = `${kidId}/${fileName}`

  const { data, error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload receipt: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

/**
 * Delete a receipt image
 */
export async function deleteReceipt(path: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.storage.from(RECEIPTS_BUCKET).remove([path])

  if (error) {
    throw new Error(`Failed to delete receipt: ${error.message}`)
  }
}

/**
 * Get a signed URL for private file access (valid for 1 hour)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}
