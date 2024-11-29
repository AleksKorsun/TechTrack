// app/payments/page.tsx

'use client';

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

const PaymentsPage = () => {
  return (
    <ProtectedRoute allowedRoles={['admin', 'finance']}>
      <h1>Payments Page</h1>
      {/* Здесь будет содержимое страницы платежей */}
    </ProtectedRoute>
  );
};

export default PaymentsPage;

