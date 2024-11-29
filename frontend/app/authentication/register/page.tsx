// app/authentication/register/page.tsx

'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FcGoogle } from 'react-icons/fc'; // Иконка для Google
import { FaFacebook } from 'react-icons/fa'; // Иконка для Facebook

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
      const requestData = {
        ...data,
        role: 'admin', // Или установите нужную вам роль
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, requestData);
      router.push('/authentication/login');
    } catch (error: any) {
      console.error('Ошибка регистрации:', error.response?.data?.detail || error.message);
      setErrorMessage(error.response?.data?.detail || 'Registration error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-appleBlue-dark to-appleBlue-light">
      <div className="flex-grow flex items-center justify-center">
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
            <Link href="/authentication/login" className="text-gold hover:underline">
              Sign In
            </Link>
          </p>
          {/* Если вам не нужны кнопки для регистрации через Google и Facebook, вы можете удалить следующий блок */}
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => console.log('Register with Google')} // Здесь вы можете реализовать логику регистрации через Google
              className="w-full p-3 rounded-md bg-white text-black font-bold hover:bg-gray-100 transition flex items-center justify-center"
            >
              <FcGoogle className="mr-2" /> Register with Google
            </button>
            <button
              type="button"
              onClick={() => console.log('Register with Facebook')} // Здесь вы можете реализовать логику регистрации через Facebook
              className="w-full p-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center justify-center"
            >
              <FaFacebook className="mr-2" /> Register with Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



