// services/orderService.ts

// Этот файл содержит функции для работы с заказами через API.
// Он использует `apiClient` для выполнения HTTP-запросов к серверу.
// Функции включают получение списка заказов, добавление нового заказа и обновление существующего заказа.
// Где используется: Обычно используется в компонентах или страницах, которые требуют взаимодействия с данными заказов,
// например, отображение списка заказов, создание нового заказа или обновление статуса заказа.
import apiClient from '../utils/apiClient';
import { Order } from '../../types';

// Получает список всех заказов с возможностью передачи параметров фильтрации.
export const getOrders = async (params = {}): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>('/orders', { params });
  return response.data;
};

// Добавляет новый заказ с предоставленными данными.
export const addNewOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const response = await apiClient.post<Order>('/orders', orderData);
  return response.data;
};

// Обновляет существующий заказ по его ID.
export const updateOrder = async (order: Order): Promise<Order> => {
  const response = await apiClient.put<Order>(`/orders/${order.id}`, order);
  return response.data;
};
