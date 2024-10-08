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
    return <div>Недействительный или отсутствующий токен</div>;
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
    <div className="..."> {/* Ваш дизайн */}
      <h1>Сброс пароля</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Введите новый пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="..."
        />
        <button type="submit">Сбросить пароль</button>
      </form>
    </div>
  );
}
