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
    <div className="..."> {/* Ваш дизайн */}
      <h1>Восстановление пароля</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Введите ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="..."
        />
        <button type="submit">Отправить ссылку для восстановления</button>
      </form>
    </div>
  );
}
