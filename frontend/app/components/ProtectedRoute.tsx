// app/components/ProtectedRoute.tsx

'use client';

import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Middleware уже проверяет доступ, здесь просто возвращаем содержимое
  return <>{children}</>;
};

export default ProtectedRoute;





