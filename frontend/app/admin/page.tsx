// app/admin/page.tsx

'use client';

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useSession } from 'next-auth/react';

const AdminPage = () => {
  const { data: session } = useSession();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div>
        <h1>Административная панель</h1>
        <p>Добро пожаловать, {session?.user.name}!</p>
        {/* Добавьте здесь компоненты для управления пользователями, заказами и т.д. */}
      </div>
    </ProtectedRoute>
  );
};

export default AdminPage;
