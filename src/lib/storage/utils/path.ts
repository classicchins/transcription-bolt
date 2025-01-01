// Storage path utilities
export function validateStoragePath(path: string): string {
  if (!path) {
    throw new Error('Storage path is required');
  }

  // Remove leading/trailing slashes and spaces
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
  
  // Split path into segments and filter out empty segments
  const segments = cleanPath.split('/').filter(Boolean);
  
  // Validate path structure
  if (segments.length < 3) {
    throw new Error('Invalid storage path: must contain uploads/user_id/filename');
  }

  if (segments[0] !== 'uploads') {
    throw new Error('Storage path must start with "uploads"');
  }

  // Validate each segment
  segments.forEach((segment, index) => {
    if (!/^[\w.-]+$/i.test(segment)) {
      throw new Error(`Invalid storage path: invalid characters in segment "${segment}"`);
    }
  });

  return cleanPath;
}