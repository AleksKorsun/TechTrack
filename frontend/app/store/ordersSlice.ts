// app/store/ordersSlice.ts

// Этот файл содержит Redux slice для управления состоянием заказов.
// Содержит состояние, асинхронные действия и редюсеры для обработки данных заказов.
// Использует сервис `orderService` для выполнения операций над заказами через API.
// Где используется: Применяется в компонентах или страницах, которые работают с заказами, например, для их отображения, создания и обновления.

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../utils/apiClient';
import { Order } from '../../types';

// Состояние для управления заказами
interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

// Асинхронное действие для загрузки заказов
export const fetchOrders = createAsyncThunk<Order[], any>(
  'orders/fetchOrders',
  async (params = {}) => {
    const response = await apiClient.get<Order[]>('/orders', { params });
    return response.data;
  }
);

// Асинхронное действие для добавления нового заказа
export const addOrder = createAsyncThunk('orders/addOrder', async (orderData: Partial<Order>) => {
  const response = await apiClient.post<Order>('/orders', orderData);
  return response.data;
});

// Асинхронное действие для обновления заказа
export const updateOrderState = createAsyncThunk('orders/updateOrderState', async (order: Order) => {
  const response = await apiClient.put<Order>(`/orders/${order.id}`, order);
  return response.data;
});

// Redux slice для управления заказами
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Устанавливает массив заказов вручную
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    // Локальное обновление состояния заказа
    updateOrderStateLocally(state, action: PayloadAction<Order>) {
      const index = state.orders.findIndex((ord) => ord.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Ошибка при загрузке заказов';
    });

    builder.addCase(addOrder.fulfilled, (state, action) => {
      state.orders.push(action.payload);
    });

    builder.addCase(updateOrderState.fulfilled, (state, action) => {
      const index = state.orders.findIndex((ord) => ord.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    });
  },
});

export const { setOrders, updateOrderStateLocally } = ordersSlice.actions;

export default ordersSlice.reducer;



