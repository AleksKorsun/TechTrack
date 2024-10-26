// app/schedule/page.tsx

'use client';

import React, { useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Calendar from '../components/Calendar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../store/eventsSlice';
import type { AppDispatch, RootState } from '../store/store';

const SchedulePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events } = useSelector((state: RootState) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  return (
    <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Календарь</h1>
        <Calendar events={events} />
      </div>
    </ProtectedRoute>
  );
};

export default SchedulePage;
