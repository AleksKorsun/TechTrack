'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListAlt, CalendarToday, Map, Group, Payment, Description, Report, Chat, CreditCard } from '@mui/icons-material';

// Типы для пропсов Sidebar
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

// Массив элементов меню с текстом и иконками
const menuItems = [
  { text: 'Home', href: '/home', icon: <Home /> },
  { text: 'Orders', href: '/orders', icon: <ListAlt /> },
  { text: 'Scheduler', href: '/schedule', icon: <CalendarToday /> },
  { text: 'Map', href: '/map', icon: <Map /> },
  { text: 'Clients', href: '/clients', icon: <Group /> },
  { text: 'Payments', href: '/payments', icon: <Payment /> },
  { text: 'Quotes', href: '/quotes', icon: <Description /> },
  { text: 'Invoices', href: '/invoices', icon: <CreditCard /> },
  { text: 'Reports', href: '/reports', icon: <Report /> },
  { text: 'Chat', href: '/chat', icon: <Chat /> },
];

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gradientStart to-gradientEnd transition-all ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Кнопка сворачивания панели */}
      <button
        onClick={toggleSidebar}
        className="absolute top-2 right-[-15px] p-2 bg-gradientApple-light rounded-full"
      >
        {isOpen ? '←' : '→'}
      </button>

      {/* Список меню */}
      <ul className="mt-16">
        {menuItems.map((item) => (
          <li
            key={item.href}
            className={`p-4 flex items-center hover:bg-gradientApple-light transition-colors duration-200 rounded-md ${pathname === item.href ? 'bg-gradientApple-dark' : ''}`}
          >
            <span className="text-white mr-4">{item.icon}</span>
            {/* Отображение текста только при развернутом меню */}
            {isOpen && (
              <Link href={item.href}>
                {item.text}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;



