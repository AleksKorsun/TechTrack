import NextAuth from 'next-auth';
import { User, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Отправляем запрос на бэкенд для аутентификации
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          // Проверяем успешный ответ от бэкенда
          if (res.data && res.data.access_token) {
            // Возвращаем данные пользователя
            return {
              ...res.data.user, // email и role
              accessToken: res.data.access_token,
              refreshToken: res.data.refresh_token,
            };
          }

          // Если неудача, возвращаем null
          return null;
        } catch (error: any) {
          console.error('Ошибка авторизации:', error.response?.data || error.message);
          throw new Error(error.response?.data?.detail || 'Ошибка авторизации');
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.email = user.email;
        token.role = user.role; // Сохраняем роль пользователя
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.expires = session.expires ?? new Date(Date.now() + 60 * 60 * 1000).toISOString();
      session.accessToken = token.accessToken ?? null;
      session.refreshToken = token.refreshToken ?? null;
      session.error = token.error ?? null;

      if (session.user) {
        session.user.email = token.email ?? null;
        session.user.role = token.role ?? null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/authentication/login',
    error: '/authentication/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
});




