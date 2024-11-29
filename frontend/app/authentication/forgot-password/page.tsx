'use client';

import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/reset-password-request', { email });
      setMessage(res.data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Ошибка при отправке запроса');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-appleBlue-dark to-appleBlue-light">
      <div className="bg-opacity-50 bg-black p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-appleGray mb-6 text-center">Восстановление пароля</h1>
        {message && <p className="text-red-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Введите ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-md bg-lightGray text-black focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            className="w-full p-3 rounded-md bg-coral text-white font-bold hover:bg-opacity-90 transition"
          >
            Отправить ссылку для восстановления
          </button>
        </form>
      </div>
    </div>
  );
}
