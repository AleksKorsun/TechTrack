'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc'; // Иконка для Google
import { FaFacebook } from 'react-icons/fa'; // Иконка для Facebook
import { signIn } from 'next-auth/react'; // Импортируем signIn из next-auth/react

const schema = yup.object().shape({
  name: yup.string().required('Enter your name'),
  email: yup.string().email('Invalid email').required('Enter your email'),
  phone: yup.string().required('Enter your phone number'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Enter your password'),
});

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      await axios.post('/api/auth/register', data);
      router.push('/login');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Registration error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-appleBlue-dark to-appleBlue-light">
      <div className="bg-opacity-50 bg-black p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-appleGray mb-6 text-center">Register</h1>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              {...register('name')}
              className="w-full p-3 rounded-md bg-lightGray text-black focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {errors.name && <span className="text-red-500">{errors.name.message}</span>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email')}
              className="w-full p-3 rounded-md bg-lightGray text-black focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {errors.email && <span className="text-red-500">{errors.email.message}</span>}
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone"
              {...register('phone')}
              className="w-full p-3 rounded-md bg-lightGray text-black focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {errors.phone && <span className="text-red-500">{errors.phone.message}</span>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password')}
              className="w-full p-3 rounded-md bg-lightGray text-black focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {errors.password && <span className="text-red-500">{errors.password.message}</span>}
          </div>
          <button
            type="submit"
            className="w-full p-3 rounded-md bg-coral text-white font-bold hover:bg-opacity-90 transition"
          >
            Register
          </button>
        </form>
        <p className="text-center text-lightGray mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-gold hover:underline">
            Sign In
          </Link>
        </p>
        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={() => signIn('google')} // Вход через Google
            className="w-full p-3 rounded-md bg-white text-black font-bold hover:bg-gray-100 transition flex items-center justify-center"
          >
            <FcGoogle className="mr-2" /> Sign in with Google
          </button>
          <button
            type="button"
            onClick={() => signIn('facebook')} // Вход через Facebook
            className="w-full p-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center justify-center"
          >
            <FaFacebook className="mr-2" /> Sign in with Facebook
          </button>
        </div>
      </div>
    </div>
  );
}

