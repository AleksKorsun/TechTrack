// app/reports/page.tsx

'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { Tabs, Tab, Box } from '@mui/material';
import EmployeePerformance from './components/EmployeePerformance';
import FinancialReports from './components/FinancialReports';
import WorkloadAnalysis from './components/WorkloadAnalysis';
import ClientReports from './components/ClientReports';
import OrderReports from './components/OrderReports';
import AnalyticsKPI from './components/AnalyticsKPI';

const ReportsPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'finance']}>
      <Box sx={{ width: '100%' }}>
        <Tabs value={selectedTab} onChange={handleChange} centered>
          <Tab label="Производительность сотрудников" />
          <Tab label="Финансовые отчёты" />
          <Tab label="Анализ загруженности" />
          <Tab label="Отчётность по клиентам" />
          <Tab label="Отчёты по заказам" />
          <Tab label="Аналитика и KPI" />
        </Tabs>
        {selectedTab === 0 && <EmployeePerformance />}
        {selectedTab === 1 && <FinancialReports />}
        {selectedTab === 2 && <WorkloadAnalysis />}
        {selectedTab === 3 && <ClientReports />}
        {selectedTab === 4 && <OrderReports />}
        {selectedTab === 5 && <AnalyticsKPI />}
      </Box>
    </ProtectedRoute>
  );
};

export default ReportsPage;
