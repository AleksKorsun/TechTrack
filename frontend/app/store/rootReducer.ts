// store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import ordersReducer from './ordersSlice'; // Если у вас есть срез для заказов

const rootReducer = combineReducers({
  dashboard: dashboardReducer,  // Убедитесь, что dashboardReducer здесь подключён
  orders: ordersReducer,        // Другие срезы при необходимости
  // добавьте другие редьюсеры
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
