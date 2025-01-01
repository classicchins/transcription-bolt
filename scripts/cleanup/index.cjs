const { getUserId, cleanupTranscriptions, resetUserStats } = require('./database.cjs');
const { cleanupStorage } = require('./storage.cjs');

async function cleanupUser(email) {
  try {
    // Get user ID
    const userId = await getUserId(email);
    console.log('Found user:', userId);

    // Cleanup in order
    await cleanupTranscriptions(userId);
    await cleanupStorage(userId);
    await resetUserStats(userId);

    return { success: true };
  } catch (error) {
    console.error('Cleanup failed:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

async function main() {
  const email = 'classicchins@gmail.com';
  console.log(`Starting cleanup for user: ${email}`);
  
  const result = await cleanupUser(email);
  
  if (!result.success) {
    console.error('Cleanup failed:', result.error);
    process.exit(1);
  }
  
  console.log('Cleanup completed successfully');
}

// Run with error handling
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});