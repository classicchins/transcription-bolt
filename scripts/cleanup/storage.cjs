const { supabase } = require('./supabase.cjs');

async function cleanupStorage(userId) {
  console.log('Cleaning up storage files...');
  
  const { data: files, error: listError } = await supabase.storage
    .from('audio')
    .list(`uploads/${userId}`);

  if (listError) throw listError;
  
  if (files?.length) {
    const paths = files.map(file => `uploads/${userId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('audio')
      .remove(paths);
      
    if (deleteError) throw deleteError;
  }
}

module.exports = { cleanupStorage };