// app/schedule/page.tsx

'use client';

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Calendar from './components/Calendar';

const SchedulePage = () => {
  return (
    <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Calendar</h1>
        <Calendar />
      </div>
    </ProtectedRoute>
  );
};

export default SchedulePage;



