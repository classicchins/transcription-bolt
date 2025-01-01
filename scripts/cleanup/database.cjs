const { supabase } = require('./supabase.cjs');

async function getUserId(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error) throw error;
  if (!data?.id) throw new Error(`User not found: ${email}`);
  
  return data.id;
}

async function cleanupTranscriptions(userId) {
  console.log('Deleting transcriptions...');
  const { error } = await supabase
    .from('transcriptions')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

async function resetUserStats(userId) {
  console.log('Resetting user stats...');
  const { error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      total_transcriptions: 0,
      completed_transcriptions: 0,
      processing_transcriptions: 0,
      failed_transcriptions: 0,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
}

module.exports = {
  getUserId,
  cleanupTranscriptions,
  resetUserStats
};