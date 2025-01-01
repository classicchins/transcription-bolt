import { StorageError } from '../types';

export function validateStoragePath(path: string): string {
  if (!path) {
    throw new StorageError('Storage path is required');
  }

  // Clean path
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
  
  // Validate path structure
  const segments = cleanPath.split('/');
  if (segments.length < 3) {
    throw new StorageError('Invalid storage path structure');
  }

  if (segments[0] !== 'uploads') {
    throw new StorageError('Storage path must start with "uploads"');
  }

  // Validate each segment
  segments.forEach(segment => {
    if (!segment || !/^[\w.-]+$/i.test(segment)) {
      throw new StorageError('Invalid characters in storage path');
    }
  });

  return cleanPath;
}