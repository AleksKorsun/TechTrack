// app/map/page.tsx

'use client';

import ProtectedRoute from '../components/ProtectedRoute';
import Map from '../components/Map';

export default function MapPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'technician']}>
      <Map />
    </ProtectedRoute>
  );
}


