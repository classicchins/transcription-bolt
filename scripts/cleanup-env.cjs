// Load environment variables
require('dotenv').config();

// Export environment for cleanup script
module.exports = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: process.env.VITE_SUPABASE_ANON_KEY
};