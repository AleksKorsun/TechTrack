// app/reports/components/AnalyticsKPI.tsx

'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient'; // Замените на правильный путь к apiClient
import { Box, Typography, Grid, Paper } from '@mui/material';

// Определим интерфейс для KPI данных
interface KPIData {
  avgRevenuePerEmployee: number;
  clientRetention: number;
  conversionRate: number;
}

const AnalyticsKPI = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    avgRevenuePerEmployee: 0,
    clientRetention: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    apiClient
      .get('/api/reports/kpi')
      .then((response) => setKpiData(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Аналитика и KPI</Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Средний доход на сотрудника</Typography>
            <Typography variant="h4">{kpiData.avgRevenuePerEmployee}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Удержание клиентов</Typography>
            <Typography variant="h4">{kpiData.clientRetention}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Коэффициент конверсии</Typography>
            <Typography variant="h4">{kpiData.conversionRate}%</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsKPI;

