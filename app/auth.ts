import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt-ts';
import { supabase } from '@/app/lib/supabase';
import { authConfig } from '@/app/auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) {
          return null;
        }

        try {
          // Get user from Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

          if (error || !user) {
            return null;
          }

          // Verify password
          const passwordsMatch = await compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          // Check if user is verified
          if (user.status !== 'verified') {
            return null;
          }

          return {
            id: user.id,
            username: user.username,
            role: user.role,
            companyId: user.company_id,
          };
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
});
