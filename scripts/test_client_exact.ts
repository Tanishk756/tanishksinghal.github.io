import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const PUBLIC_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

console.log('Testing createClient with:');
console.log('URL:', SUPABASE_URL);
console.log('Key:', PUBLIC_KEY);

const client = createClient(SUPABASE_URL, PUBLIC_KEY);

async function testAll() {
  console.log('\n--- 1. Testing getSession() ---');
  try {
    const { data, error } = await client.auth.getSession();
    console.log('getSession data:', data);
    console.log('getSession error:', error);
  } catch (err) {
    console.error('getSession thrown error:', err);
  }

  console.log('\n--- 2. Testing signInWithPassword() ---');
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: 'tanishksinghal6285@gmail.com',
      password: 'test-wrong-password'
    });
    console.log('signIn data:', data);
    console.log('signIn error:', error);
  } catch (err) {
    console.error('signIn thrown error:', err);
  }

  console.log('\n--- 3. Testing REST select from public table ---');
  try {
    const { data, error } = await client.from('profiles').select('id, full_name, headline');
    console.log('from profiles data:', data);
    console.log('from profiles error:', error);
  } catch (err) {
    console.error('from profiles thrown error:', err);
  }
}

testAll().catch(console.error);
