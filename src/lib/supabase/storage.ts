import { createClient } from './client';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export async function uploadDatasetFile(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new StorageError(
      `File size exceeds 3MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    );
  }

  // Validate file type
  if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
    throw new StorageError('Only CSV and JSON files are supported');
  }

  const supabase = createClient();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${crypto.randomUUID()}-${sanitizedName}`;

  // Determine content type from validated extension, not user-controlled file.type
  const contentType = file.name.endsWith('.csv') ? 'text/csv' : 'application/json';

  const { data, error } = await supabase.storage
    .from('datasets')
    .upload(fileName, file, { contentType });

  if (error) {
    throw new StorageError(`Upload failed: ${error.message}`);
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from('datasets')
    .createSignedUrl(data.path, 3600);
  if (urlError || !urlData?.signedUrl) {
    throw new Error('Failed to generate access URL for uploaded file');
  }
  return urlData.signedUrl;
}
