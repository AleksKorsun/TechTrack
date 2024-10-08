// app/orders/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrderTable from './components/OrderTable';
import { fetchOrders } from '../store/ordersSlice';
import { AppDispatch, RootState } from '@store/store'; // Правильные типы

const OrdersPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Orders List</h1>
      <OrderTable orders={orders} />
    </div>
  );
};

export default OrdersPage;

