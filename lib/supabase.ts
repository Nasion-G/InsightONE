import { createBrowserClient } from '@supabase/ssr';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storageKey: 'supabase.auth.token',
      storage: {
        getItem: (key: string) => {
          const item = localStorage.getItem(key);
          console.log('Getting item from storage:', key, item);
          return item;
        },
        setItem: (key: string, value: string) => {
          console.log('Setting item in storage:', key, value);
          localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          console.log('Removing item from storage:', key);
          localStorage.removeItem(key);
        },
      },
    },
  }
); 