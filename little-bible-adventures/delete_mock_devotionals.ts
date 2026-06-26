import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('internal_blog_posts')
    .delete()
    .in('title', ['God Is Love', 'God Is Willing']);

  if (error) {
    console.error('Error deleting:', error);
  } else {
    console.log('Deleted successfully', data);
  }
}

run();
