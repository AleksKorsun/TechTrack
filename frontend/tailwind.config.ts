import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        appleBlue: {
          light: '#dbeafe', // светлый синий
          DEFAULT: '#1e3a8a', // основной синий
          dark: '#1e40af', // тёмный синий
        },
        appleBrown: {
          light: '#f3e5ab', // светло-коричневый для хедера/футера
          DEFAULT: '#a0522d', // основной коричневый
          dark: '#8b4513', // тёмный коричневый для нижней панели (футер)
        },
        appleGray: '#f8f8f8', // светло-серый для основного контента
        appleDarkGray: '#333333', // тёмно-серый для текста
        appleLight: '#ededed', // светло-серый фон
        // Новые добавленные цвета для градиентов
        gradientStart: '#6699CC', // начальный цвет градиента
        gradientEnd: '#003366',   // конечный цвет градиента
        gradientApple: {
          light: '#dae7f5', // светлый градиентный цвет
          DEFAULT: '#3b5998', // основной градиент
          dark: '#1c2e50', // тёмный градиент
        },
      },
    },
  },
  plugins: [],
};

export default config;


