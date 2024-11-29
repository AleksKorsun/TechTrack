const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8000', // Убедитесь, что это значение совпадает с тем, что указано в .env
  },
  // Дополнительные настройки, если требуются
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`, // Прокси запросов на API
      },
    ];
  },
};

// Экспорт в стиле ES-модуля
export default nextConfig;




