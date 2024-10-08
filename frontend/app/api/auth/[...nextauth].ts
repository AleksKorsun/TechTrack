import NextAuth from 'next-auth';
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
          // Обрабатываем авторизацию через API
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          // Проверяем успешный ответ от API
          if (res.data && res.data.access_token) {
            return { ...res.data }; // Возвращаем данные пользователя
          }

          // Если неудача, возвращаем null
          return null;
        } catch (error: any) {  // Приведение типа error к any
          console.error('Ошибка авторизации:', error.response?.data || error.message);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Добавляем access_token в токен, если он есть
      if (user) {
        token.accessToken = (user as any).access_token;  // Приведение user к any
      }
      return token;
    },
    async session({ session, token }) {
      // Добавляем access_token в сессию
      session.accessToken = token.accessToken as string;  // Явное приведение к string
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin', // Пользовательская страница входа
    error: '/auth/error', // Страница ошибки
  },
  secret: process.env.NEXTAUTH_SECRET, // Секретный ключ для шифрования
});

