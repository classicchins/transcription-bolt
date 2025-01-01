import { uploadService } from './upload/services/upload-service';
import type { UploadError } from './types';

export async function uploadFiles(files: File[], userId: string) {
  const results = [];
  const errors: UploadError[] = [];

  for (const file of files) {
    const result = await uploadService.uploadFile(file, userId);
    
    if (result.data?.length) {
      results.push(...result.data);
    }
    
    if (result.errors?.length) {
      errors.push(...result.errors);
    }
  }

  return {
    data: results,
    errors: errors.length > 0 ? errors : null
  };
}