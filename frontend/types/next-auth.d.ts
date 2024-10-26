import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id?: string | null;
    role?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    error?: string | null;
    phone?: string | null;
  }

  interface Session extends DefaultSession {
    accessToken?: string | null;
    refreshToken?: string | null;
    error?: string | null;
    user: {
      id?: string | null;
      phone?: string | null;
      email?: string | null;
      name?: string | null;
      role?: string | null;
      accessToken?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string | null;
    refreshToken?: string | null;
    role?: string | null;
    email?: string | null;
    accessTokenExpires?: number | null;
    error?: string | null;
  }
}


