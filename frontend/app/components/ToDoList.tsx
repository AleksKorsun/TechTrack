// components/ToDoList.tsx
'use client';

import React from 'react';

const ToDoList = () => {
  return (
    <div className="bg-gradient-to-r from-appleLight to-appleGray p-4 rounded shadow mb-8">
      <h2 className="text-xl font-semibold mb-2 text-appleDarkGray">To Do</h2>
      <ul className="list-disc list-inside text-appleDarkGray">
        <li>Изучите клиентский портал</li>
        <li>Создайте быстрый инвойс</li>
        <li>Создайте коммерческое предложение</li>
      </ul>
    </div>
  );
};

export default ToDoList;

