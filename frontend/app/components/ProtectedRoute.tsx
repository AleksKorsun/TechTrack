'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return; // Ожидаем загрузки сессии
    }

    if (!session || !session.user) {
      router.replace('/authentication/login');
    } else if (!allowedRoles.includes(session.user.role || '')) {
      router.replace('/authentication/forbidden');
    }
  }, [session, status, allowedRoles, router]);

  if (
    status === 'loading' ||
    !session ||
    !session.user ||
    !allowedRoles.includes(session.user.role || '')
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
