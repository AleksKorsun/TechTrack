'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import { Order } from '../../../types';
import OrdersTable from './OrdersTable';

const OrdersPageContent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/orders/');
        setOrders(response.data);
      } catch (error) {
        console.error('Ошибка при получении заказов:', error);
      }
    };

    fetchOrders();
  }, []);

  return <OrdersTable orders={orders} />;
};

export default OrdersPageContent;
