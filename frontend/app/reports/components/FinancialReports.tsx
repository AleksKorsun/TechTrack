// app/reports/components/FinancialReports.tsx

'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient'; // Проверьте, что путь корректный
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';

// Определим интерфейс для каждого элемента в revenueData
interface RevenueDataItem {
  date: string;
  revenue: number;
}

const FinancialReports = () => {
  const [revenueData, setRevenueData] = useState<RevenueDataItem[]>([]);
  const [dateRange, setDateRange] = useState('monthly');

  useEffect(() => {
    apiClient
      .get('/api/reports/financial', {
        params: {
          period: dateRange,
        },
      })
      .then((response) => setRevenueData(response.data))
      .catch((error) => console.error(error));
  }, [dateRange]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Финансовые отчёты</Typography>
      <FormControl sx={{ mt: 2 }}>
        <InputLabel id="date-range-label">Период</InputLabel>
        <Select
          labelId="date-range-label"
          value={dateRange}
          label="Период"
          onChange={(e) => setDateRange(e.target.value as string)}
        >
          <MenuItem value="daily">Дневной</MenuItem>
          <MenuItem value="weekly">Недельный</MenuItem>
          <MenuItem value="monthly">Месячный</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ mt: 4 }}>
        <Bar
          data={{
            labels: revenueData.map((item) => item.date),
            datasets: [
              {
                label: 'Выручка',
                data: revenueData.map((item) => item.revenue),
                backgroundColor: 'green',
              },
            ],
          }}
        />
      </Box>
    </Box>
  );
};

export default FinancialReports;

