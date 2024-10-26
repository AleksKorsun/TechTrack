// app/reports/page.tsx

'use client';

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

const ReportsPage = () => {
  return (
    <ProtectedRoute allowedRoles={['admin', 'finance']}>
      <h1>Reports Page</h1>
      {/* Здесь будет содержимое страницы отчётов */}
    </ProtectedRoute>
  );
};

export default ReportsPage;
