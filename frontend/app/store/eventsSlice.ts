// store/eventsSlice.ts

// Этот файл содержит Redux slice для управления событиями.
// Содержит состояние, асинхронные действия и редюсеры для обработки данных событий.
// Использует `createAsyncThunk` для выполнения асинхронных операций, таких как загрузка, добавление и обновление событий.
// Где используется: Используется в компонентах или страницах, которые работают с событиями, например, для отображения календаря или управления событиями.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../utils/apiClient';
import { Event } from '../../types';

// Состояние для управления событиями
interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
};

// Асинхронное действие для загрузки всех событий
export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
  const response = await apiClient.get<Event[]>('/orders/');
  return response.data;
});

// Асинхронное действие для добавления нового события
export const addEvent = createAsyncThunk('events/addEvent', async (eventData: Partial<Event>) => {
  const response = await apiClient.post<Event>('/orders/', eventData);
  return response.data;
});

// Асинхронное действие для обновления существующего события
export const updateEvent = createAsyncThunk('events/updateEvent', async (eventData: Event) => {
  const response = await apiClient.put<Event>(`/orders/${eventData.id}/`, eventData);
  return response.data;
});

// Redux slice для управления событиями
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.events = action.payload;
      state.loading = false;
    });
    builder.addCase(addEvent.fulfilled, (state, action) => {
      state.events.push(action.payload);
    });
    builder.addCase(updateEvent.fulfilled, (state, action) => {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    });
  },
});

export default eventsSlice.reducer;
