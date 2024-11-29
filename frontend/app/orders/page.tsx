// app/orders/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import apiClient from '../utils/apiClient';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import OrdersTable from './components/OrdersTable';
import { Order } from '../../types';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/orders/');
        setOrders(response.data);
      } catch (error) {
        setError('Ошибка при получении заказов');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (paymentFilter === 'All') return true;
    return order.paymentStatus === paymentFilter;
  });

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'client']}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Список заказов</h1>

        <div className="flex items-center mb-4">
          <FormControl variant="outlined" size="small">
            <InputLabel id="payment-filter-label">Статус оплаты</InputLabel>
            <Select
              labelId="payment-filter-label"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as string)}
              label="Статус оплаты"
            >
              <MenuItem value="All">Все</MenuItem>
              <MenuItem value="Paid">Оплачено</MenuItem>
              <MenuItem value="Overdue">Просрочено</MenuItem>
              <MenuItem value="Pending">Ожидает оплаты</MenuItem>
            </Select>
          </FormControl>
        </div>

        <OrdersTable orders={filteredOrders} />
      </div>
    </ProtectedRoute>
  );
};

export default OrdersPage;






