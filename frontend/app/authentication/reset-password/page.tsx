'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  if (!token) {
    return <div className="min-h-screen w-full flex items-center justify-center text-center">Недействительный или отсутствующий токен</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/reset-password', { token, new_password: newPassword });
      setMessage(res.data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Ошибка при сбросе пароля');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-appleBlue-dark to-appleBlue-light">
      <div className="bg-opacity-50 bg-black p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-appleGray mb-6 text-center">Сброс пароля</h1>
        {message && <p className="text-red-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Введите новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 rounded-md bg-lightGray text-black focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            className="w-full p-3 rounded-md bg-coral text-white font-bold hover:bg-opacity-90 transition"
          >
            Сбросить пароль
          </button>
        </form>
      </div>
    </div>
  );
}

