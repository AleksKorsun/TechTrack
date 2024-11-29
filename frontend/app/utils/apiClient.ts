// app/utils/apiClient.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true, // Включаем отправку куки с запросами
});

// Логирование запросов
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[APIClient] Запрос: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`[APIClient] Заголовки:`, config.headers);
    console.log(`[APIClient] Данные:`, config.data);
    return config;
  },
  (error) => {
    console.error(`[APIClient] Ошибка запроса:`, error.message);
    return Promise.reject(error);
  }
);

// Логирование ответов
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[APIClient] Ответ: ${response.status} ${response.config.url}`);
    console.log(`[APIClient] Данные ответа:`, response.data);
    return response;
  },
  (error) => {
    console.error(`[APIClient] Ошибка ответа:`, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;








