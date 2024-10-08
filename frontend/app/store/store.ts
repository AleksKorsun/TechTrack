import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './ordersSlice'; // Импорт редюсера заказов
import dashboardReducer from './dashboardSlice'; // Импорт редюсера для dashboard

// Создаем store с ordersReducer и dashboardReducer
const store = configureStore({
  reducer: {
    orders: ordersReducer,
    dashboard: dashboardReducer, // Добавляем dashboard в редюсеры
  },
});

// Экспортируем тип RootState, чтобы его можно было использовать для типизации useSelector
export type RootState = ReturnType<typeof store.getState>;

// Экспортируем тип AppDispatch, чтобы его можно было использовать для типизации useDispatch
export type AppDispatch = typeof store.dispatch;

export default store;