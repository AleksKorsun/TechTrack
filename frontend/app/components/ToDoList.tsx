// components/ToDoList.tsx
'use client';

import React from 'react';

const ToDoList = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">To Do</h2>
      <ul className="space-y-2">
        <li className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Изучите клиентский портал</span>
        </li>
        <li className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Создайте быстрый инвойс</span>
        </li>
        <li className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Создайте коммерческое предложение</span>
        </li>
      </ul>
    </div>
  );
};

export default ToDoList;
