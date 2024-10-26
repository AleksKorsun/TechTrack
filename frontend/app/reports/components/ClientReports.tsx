// app/reports/components/ClientReports.tsx

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';

const ClientReports = () => {
  const [clientData, setClientData] = useState([]);

  useEffect(() => {
    axios
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
            labels: clientData.map((item: any) => item.client_category),
            datasets: [
              {
                data: clientData.map((item: any) => item.count),
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
