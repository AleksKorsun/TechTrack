'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  if (status === 'loading') {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h1>Добро пожаловать, {session?.user?.name}</h1>
      {/* Контент защищённой страницы */}
    </div>
  );
}
