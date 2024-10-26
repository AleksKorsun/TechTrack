// components/KPIWidget.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface KPIWidgetProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({ title, value, icon, color, link }) => {
  const router = useRouter();

  return (
    <div
      className={`p-4 rounded-lg shadow-md cursor-pointer bg-white hover:shadow-lg transition-shadow duration-300`}
      onClick={() => router.push(link)}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white`}>
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold">{value}</h2>
          <p className="text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default KPIWidget;


