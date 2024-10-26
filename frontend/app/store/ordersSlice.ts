// app/store/ordersSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getOrders, addNewOrder, updateOrder } from '../services/orderService';
import { Order } from '../../types';
import axiosInstance from '../utils/axiosInstance';



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

// Загрузка заказов через сервис
export const fetchOrders = createAsyncThunk<Order[], any>(
  'orders/fetchOrders',
  async (params = {}) => {
    const response = await axiosInstance.get<Order[]>('/orders', { params });
    return response.data;
  }
);

// Добавление нового заказа через сервис
export const addOrder = createAsyncThunk('orders/addOrder', async (orderData: Partial<Order>) => {
  const data = await addNewOrder(orderData);
  return data;
});

// Обновление состояния заказа через сервис
export const updateOrderState = createAsyncThunk('orders/updateOrderState', async (order: Order) => {
  const data = await updateOrder(order);
  return data;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    updateOrderStateLocally(state, action: PayloadAction<Order>) {
      const index = state.orders.findIndex((ord) => ord.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
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

    // Add order
    builder.addCase(addOrder.fulfilled, (state, action) => {
      state.orders.push(action.payload);
    });

    // Update order
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


