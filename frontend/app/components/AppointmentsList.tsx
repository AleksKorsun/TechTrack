// components/AppointmentsList.tsx
'use client';

import React from 'react';

const AppointmentsList = () => {
  return (
    <div className="bg-gradient-to-b from-appleLight to-appleGray p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2 text-appleDarkGray">Сегодняшние встречи</h2>
      <p className="text-appleDarkGray">Здесь будут показаны встречи на сегодня</p>
    </div>
  );
};

export default AppointmentsList;

