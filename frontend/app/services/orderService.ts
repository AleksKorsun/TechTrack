// services/orderService.ts

import axiosInstance from '../utils/axiosInstance';
import { Order } from '../../types';

export const getOrders = async (params = {}): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>('/orders', { params });
  return response.data;
};

export const addNewOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const response = await axiosInstance.post<Order>('/orders', orderData);
  return response.data;
};

export const updateOrder = async (order: Order): Promise<Order> => {
  const response = await axiosInstance.put<Order>(`/orders/${order.id}`, order);
  return response.data;
};
