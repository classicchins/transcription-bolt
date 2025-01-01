import { cleanupService } from '../src/lib/cleanup/services/cleanup-service';

async function cleanup() {
  const email = 'classicchins@gmail.com';
  console.log(`Starting cleanup for user: ${email}`);
  
  const result = await cleanupService.cleanupUserData(email);
  
  if (result.success) {
    console.log('Cleanup completed successfully');
  } else {
    console.error('Cleanup failed:', result.error);
  }
}

cleanup().catch(console.error);