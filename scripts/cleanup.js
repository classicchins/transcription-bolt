import { cleanupService } from '../src/lib/cleanup/services/cleanup-service.js';

async function cleanup() {
  const email = 'classicchins@gmail.com';
  console.log(`Starting cleanup for user: ${email}`);
  
  try {
    const result = await cleanupService.cleanupUserData(email);
    
    if (result.success) {
      console.log('Cleanup completed successfully');
    } else {
      console.error('Cleanup failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanup().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});