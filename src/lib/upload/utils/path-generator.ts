import { nanoid } from 'nanoid';

export function generateStoragePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomId = nanoid(8);
  const fileExt = fileName.split('.').pop();
  const sanitizedName = `${timestamp}-${randomId}.${fileExt}`;
  return `uploads/${userId}/${sanitizedName}`;
}