import { NextAuthConfig } from 'next-auth';
import { User } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAuth = nextUrl.pathname.startsWith('/login') || 
                      nextUrl.pathname.startsWith('/register') ||
                      nextUrl.pathname.startsWith('/verify-otp');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as User;
        token.id = typedUser.id;
        token.role = typedUser.role;
        token.companyId = typedUser.companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'user';
        session.user.companyId = token.companyId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
