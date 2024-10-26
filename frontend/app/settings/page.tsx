// app/settings/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Typography, Container } from '@mui/material';
import apiClient from '../utils/apiClient';

const SettingsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Добавьте другие поля, если необходимо
  });

  useEffect(() => {
    if (!session) {
      router.push('/login');
    } else {
      // Заполните форму данными пользователя из сессии
      setFormData({
        name: session.user?.name || '',
        email: session.user?.email || '',
        phone: session.user?.phone || '',
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put('/users/me', formData);
      // Обновите сессию, если необходимо
      alert('Данные успешно обновлены');
    } catch (error: any) {
      console.error('Ошибка при обновлении данных:', error);
      alert(error.response?.data?.detail || 'Ошибка при обновлении данных');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Настройки профиля
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled // Email обычно не разрешается изменять
        />
        <TextField
          label="Телефон"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {/* Добавьте другие поля по необходимости */}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Сохранить изменения
        </Button>
      </form>
    </Container>
  );
};

export default SettingsPage;
