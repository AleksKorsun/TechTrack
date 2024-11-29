// components/AppointmentsList.tsx
'use client';

import React from 'react';

const AppointmentsList = () => {
  const appointments = [
    { id: 1, time: '10:00 AM', client: 'Иван Иванов', service: 'Ремонт кондиционера' },
    { id: 2, time: '12:00 PM', client: 'Петр Петров', service: 'Установка стиральной машины' },
    // ... другие встречи
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Сегодняшние встречи</h2>
      <ul className="divide-y divide-gray-200">
        {appointments.map((appt) => (
          <li key={appt.id} className="py-2 flex justify-between items-center">
            <div>
              <p className="font-medium">{appt.client}</p>
              <p className="text-sm text-gray-500">{appt.service}</p>
            </div>
            <p className="text-gray-600">{appt.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppointmentsList;


