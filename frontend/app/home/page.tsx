// app/home/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import KPIWidget from '../components/KPIWidget';
import ToDoList from '../components/ToDoList';
import AppointmentsList from '../components/AppointmentsList';
import FinancialChart from '../components/FinancialChart';
import ActivityFeed from '../components/ActivityFeed';
import { AssignmentTurnedIn, MonetizationOn, People, Event } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setVirtualDashboardData } from '../store/dashboardSlice';
import type { AppDispatch, RootState } from '@store/store';

// Chart.js Registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: RootState) => state.dashboard) as { data: { newOrders: number; revenue: number; newClients: number; appointments: number; activityFeed: { id: number; message: string; timestamp: string }[]; financialData: { month: string; revenue: number }[]; activeTechnicians: number } };

  // Управление Sidebar
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Создаем виртуальные данные для отображения на дашборде
  useEffect(() => {
    const virtualData = {
      newOrders: 15,
      revenue: 12500,
      newClients: 8,
      appointments: 12,
      activeTechnicians: 5,
      activityFeed: [
        { id: 1, message: 'Заказ #101 завершен', timestamp: '2024-10-01 10:15' },
        { id: 2, message: 'Новый клиент: Иван Иванов', timestamp: '2024-10-01 11:00' },
        { id: 3, message: 'Назначена встреча на 2024-10-02', timestamp: '2024-10-01 12:30' },
      ],
      financialData: [
        { month: 'Январь', revenue: 8000 },
        { month: 'Февраль', revenue: 9500 },
        { month: 'Март', revenue: 11000 },
        { month: 'Апрель', revenue: 12500 },
      ],
    };
    dispatch(setVirtualDashboardData(virtualData));
  }, [dispatch]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar с функцией скрытия */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        <main className="p-4 mt-16 bg-gray-100 min-h-screen overflow-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Добро пожаловать в TechTrack</h1>

          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPIWidget
              title="Новые заказы"
              value={data?.newOrders ?? 0}
              icon={<AssignmentTurnedIn />}
              color="bg-blue-500"
              link="/orders"
            />
            <KPIWidget
              title="Доходы"
              value={data?.revenue ?? 0}
              icon={<MonetizationOn />}
              color="bg-green-500"
              link="/revenue"
            />
            <KPIWidget
              title="Новые клиенты"
              value={data?.newClients ?? 0}
              icon={<People />}
              color="bg-purple-500"
              link="/clients"
            />
            <KPIWidget
              title="Запланированные встречи"
              value={data?.appointments ?? 0}
              icon={<Event />}
              color="bg-yellow-500"
              link="/appointments"
            />
          </div>

          {/* To-Do List Section */}
          <div className="mb-8">
            <ToDoList />
          </div>

          {/* Today's Appointments Section */}
          <div className="mb-8">
            <AppointmentsList />
          </div>

          {/* Финансовая статистика */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Финансовая статистика</h2>
            <div className="h-64 bg-white rounded-lg shadow-md">
              <FinancialChart data={data.financialData} />
            </div>
          </div>

          {/* Activity Feed Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Лента активности</h2>
            <div className="h-64 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
              <ActivityFeed activities={data.activityFeed} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;



