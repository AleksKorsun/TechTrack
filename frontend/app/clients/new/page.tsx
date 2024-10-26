// app/clients/new/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../utils/apiClient';
import { TextField, Button } from '@mui/material';

const NewClientPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/clients/', formData);
      router.push('/clients');
    } catch (error: any) {
      setError('Ошибка при добавлении клиента');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Добавить нового клиента</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Телефон"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Адрес"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Сохранить
        </Button>
      </form>
    </div>
  );
};

export default NewClientPage;
