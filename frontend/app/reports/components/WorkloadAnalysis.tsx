// app/reports/components/WorkloadAnalysis.tsx

'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient'; // Убедитесь, что путь корректен
import { Box, Typography } from '@mui/material';
import { HeatMapGrid } from 'react-grid-heatmap';

const WorkloadAnalysis = () => {
  const [workloadData, setWorkloadData] = useState<number[][]>([]); // Типизируем workloadData как массив массивов чисел

  useEffect(() => {
    apiClient
      .get('/api/reports/workload')
      .then((response) => setWorkloadData(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Анализ загруженности</Typography>
      <Box sx={{ mt: 4 }}>
        <HeatMapGrid
          data={workloadData}
          xLabels={['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']}
          yLabels={['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4']}
          cellRender={(x: number, y: number, value: number) => <span>{value}</span>}
        />
      </Box>
    </Box>
  );
};

export default WorkloadAnalysis;

