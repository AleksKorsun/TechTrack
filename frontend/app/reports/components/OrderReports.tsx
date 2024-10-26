// app/reports/components/OrderReports.tsx

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';

const OrderReports = () => {
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    axios
      .get('/api/reports/orders')
      .then((response) => setOrderData(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Отчёты по заказам</Typography>
      <Box sx={{ mt: 4 }}>
        <Doughnut
          data={{
            labels: ['Завершённые', 'Активные', 'Отменённые'],
            datasets: [
              {
                data: [
                  orderData.completed,
                  orderData.active,
                  orderData.cancelled,
                ],
                backgroundColor: ['green', 'blue', 'red'],
              },
            ],
          }}
        />
      </Box>
    </Box>
  );
};

export default OrderReports;
