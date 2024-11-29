// store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './ordersSlice'; // Редьюсер для заказов
import dashboardReducer from './dashboardSlice'; // Редьюсер для дашборда
import eventsReducer from './eventsSlice'; // Редьюсер для событий
import techniciansReducer from './techniciansSlice'; // Редьюсер для техников

const store = configureStore({
  reducer: {
    orders: ordersReducer,       // Редьюсер для заказов
    dashboard: dashboardReducer, // Редьюсер для дашборда
    events: eventsReducer,       // Редьюсер для событий
    technicians: techniciansReducer, // Редьюсер для техников
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;


