// app/chat/page.tsx

'use client';

import ProtectedRoute from '../components/ProtectedRoute';

export default function ChatPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'technician', 'client']}>
      <h1>Chat Page</h1>
      {/* Здесь содержимое чата */}
    </ProtectedRoute>
  );
}
