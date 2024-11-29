// app/admin/page.tsx

'use client';

import React from 'react';
import { useAuth } from '../authentication/context/AuthContext';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    router.push('/authentication/login');
    return null;
  }

  if (user.role !== 'admin') {
    return <div>Доступ запрещён</div>;
  }

  return (
    <div>
      <h1>Административная панель</h1>
      <p>Добро пожаловать, {user.name}!</p>
      {/* Добавьте здесь компоненты для управления пользователями, заказами и т.д. */}
    </div>
  );
};

export default AdminPage;

