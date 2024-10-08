import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    user?: {
      id?: string | null;
      email?: string | null;
      name?: string | null;
      accessToken?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    access_token?: string;
  }
}
