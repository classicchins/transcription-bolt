const { SUPABASE_URL, SUPABASE_KEY } = require('./cleanup-env.cjs');
const { createClient } = require('@supabase/supabase-js');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanupUserData(email) {
  try {
    // Get user ID from email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData?.id) {
      throw new Error('User not found');
    }

    const userId = userData.id;
    console.log('Found user:', userId);

    // Delete all transcriptions first (will cascade to files)
    console.log('Deleting transcriptions...');
    const { error: deleteError } = await supabase
      .from('transcriptions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Delete storage files
    console.log('Cleaning up storage...');
    const { data: storageFiles } = await supabase.storage
      .from('audio')
      .list(`uploads/${userId}`);

    if (storageFiles?.length) {
      const filePaths = storageFiles.map(file => `uploads/${userId}/${file.name}`);
      await supabase.storage
        .from('audio')
        .remove(filePaths);
    }

    // Reset user stats
    console.log('Resetting user stats...');
    const { error: statsError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_transcriptions: 0,
        completed_transcriptions: 0,
        processing_transcriptions: 0,
        failed_transcriptions: 0,
        updated_at: new Date().toISOString()
      });

    if (statsError) throw statsError;

    return { success: true };
  } catch (error) {
    console.error('Cleanup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cleanup user data'
    };
  }
}

async function cleanup() {
  const email = 'classicchins@gmail.com';
  console.log(`Starting cleanup for user: ${email}`);
  
  const result = await cleanupUserData(email);
  
  if (result.success) {
    console.log('Cleanup completed successfully');
  } else {
    console.error('Cleanup failed:', result.error);
    process.exit(1);
  }
}

cleanup().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});