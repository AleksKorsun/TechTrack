// app/reports/components/ClientReports.tsx

'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient'; // Замените на правильный путь к apiClient
import { Box, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';

interface ClientData {
  client_category: string;
  count: number;
}

const ClientReports = () => {
  const [clientData, setClientData] = useState<ClientData[]>([]);

  useEffect(() => {
    apiClient
      .get('/api/reports/clients')
      .then((response) => setClientData(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Отчётность по клиентам</Typography>
      <Box sx={{ mt: 4 }}>
        <Pie
          data={{
            labels: clientData.map((item) => item.client_category),
            datasets: [
              {
                data: clientData.map((item) => item.count),
                backgroundColor: ['red', 'blue', 'green', 'yellow'],
              },
            ],
          }}
        />
      </Box>
    </Box>
  );
};

export default ClientReports;

