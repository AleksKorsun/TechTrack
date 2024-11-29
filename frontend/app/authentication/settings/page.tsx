// app/settings/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Typography, Container } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import apiClient from '../../utils/apiClient';
import { User } from '../../../types';


const SettingsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/authentication/login');
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put('/users/me', formData);
      alert('Данные успешно обновлены');
    } catch (error: any) {
      console.error('Ошибка при обновлении данных:', error);
      alert(error.response?.data?.detail || 'Ошибка при обновлении данных');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return null;
  }

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
          disabled // Email обычно не изменяется
        />
        <TextField
          label="Телефон"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Сохранить изменения
        </Button>
      </form>
    </Container>
  );
};

export default SettingsPage;

