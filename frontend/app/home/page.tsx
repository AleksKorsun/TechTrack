// app/home/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
// Убираем ProtectedRoute для проверки отображения
import KPIWidget from '../components/KPIWidget';
import ToDoList from '../components/ToDoList';
import AppointmentsList from '../components/AppointmentsList';
import FinancialChart from '../components/FinancialChart';
import ActivityFeed from '../components/ActivityFeed';
import { AssignmentTurnedIn, MonetizationOn, People, Event } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setVirtualDashboardData } from '../store/dashboardSlice';
import type { AppDispatch, RootState } from '@store/store';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: RootState) => state.dashboard) as {
    data: {
      newOrders: number;
      revenue: number;
      newClients: number;
      appointments: number;
      activityFeed: { id: number; message: string; timestamp: string }[];
      financialData: { month: string; revenue: number }[];
      activeTechnicians: number;
    };
  };

  useEffect(() => {
    const virtualData = {
      newOrders: 15,
      revenue: 12500,
      newClients: 8,
      appointments: 12,
      activeTechnicians: 5,
      activityFeed: [
        { id: 1, message: 'Order #101 completed', timestamp: '2024-10-01 10:15' },
        { id: 2, message: 'New client: Ivan Ivanov', timestamp: '2024-10-01 11:00' },
        { id: 3, message: 'Appointment scheduled for 2024-10-02', timestamp: '2024-10-01 12:30' },
      ],
      financialData: [
        { month: 'January', revenue: 8000 },
        { month: 'February', revenue: 9500 },
        { month: 'March', revenue: 11000 },
        { month: 'April', revenue: 12500 },
      ],
    };
    dispatch(setVirtualDashboardData(virtualData));
  }, [dispatch]);

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-grow transition-all duration-300">
        <main className="flex-grow p-4 mt-16 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Welcome to TechTrack</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPIWidget
              title="New Orders"
              value={data?.newOrders ?? 0}
              icon={<AssignmentTurnedIn />}
              color="bg-blue-500"
              link="/orders"
            />
            <KPIWidget
              title="Revenue"
              value={data?.revenue ?? 0}
              icon={<MonetizationOn />}
              color="bg-green-500"
              link="/revenue"
            />
            <KPIWidget
              title="New Clients"
              value={data?.newClients ?? 0}
              icon={<People />}
              color="bg-purple-500"
              link="/clients"
            />
            <KPIWidget
              title="Scheduled Appointments"
              value={data?.appointments ?? 0}
              icon={<Event />}
              color="bg-yellow-500"
              link="/appointments"
            />
          </div>

          <div className="mb-8">
            <ToDoList />
          </div>

          <div className="mb-8">
            <AppointmentsList />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Financial Statistics</h2>
            <div className="h-[400px] w-full bg-white rounded-lg shadow-md overflow-hidden">
              <FinancialChart data={data?.financialData} />
            </div>
          </div>

          <div className="mt-8 overflow-y-scroll" style={{ maxHeight: '75vh' }}>
            <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
            <div className="w-full bg-white rounded-lg shadow-md p-4">
              <ActivityFeed activities={data?.activityFeed} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;









