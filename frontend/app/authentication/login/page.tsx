// app/authentication/login/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const { login, user, loading } = useAuth();

  // Если пользователь уже авторизован, перенаправляем его на /dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('Пользователь уже авторизован. Перенаправляем на /home');
      router.push('/home'); // Или другая страница по умолчанию
    }
  }, [user, loading, router]);

  const handleLogin = async (event: any) => {
    event.preventDefault();
    console.log('Login button clicked');
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      console.log('Attempting login with email:', email);
      await login(email, password);

      // Проверяем наличие callbackUrl и перенаправляем
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl') || '/';
      console.log('Redirecting to:', callbackUrl);
      router.push(callbackUrl);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      setErrorMessage(errorMessage);
      console.error('Ошибка входа:', errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-appleBlue-dark to-appleBlue-light">
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-opacity-50 bg-black p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-appleGray mb-6 text-center">Sign In</h1>
          {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-3 rounded-md bg-lightGray text-black focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 rounded-md bg-lightGray text-black focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 rounded-md bg-coral text-white font-bold hover:bg-opacity-90 transition"
            >
              Sign In
            </button>
          </form>
          <p className="text-center text-lightGray mt-4">
            No account?{' '}
            <Link href="/authentication/register" className="text-gold hover:underline">
              Register
            </Link>
          </p>
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => console.log('Sign in with Google')}
              className="w-full p-3 rounded-md bg-white text-black font-bold hover:bg-gray-100 transition flex items-center justify-center"
            >
              <FcGoogle className="mr-2" /> Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => console.log('Sign in with Facebook')}
              className="w-full p-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center justify-center"
            >
              <FaFacebook className="mr-2" /> Sign in with Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



