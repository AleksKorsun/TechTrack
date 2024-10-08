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
      className={`p-4 rounded shadow cursor-pointer bg-gradient-to-b from-appleLight to-appleGray text-appleDarkGray`}
      onClick={() => router.push(link)}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${color} text-white`}>{icon}</div>
        <div className="ml-4">
          <h2 className="text-lg font-semibold">{value}</h2>
          <p>{title}</p>
        </div>
      </div>
    </div>
  );
};

export default KPIWidget;


