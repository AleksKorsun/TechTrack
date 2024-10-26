'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home as HomeIcon,
  ListAlt,
  CalendarToday,
  Map as MapIcon,
  Group,
  Payment,
  Description,
  Report,
  Chat,
  CreditCard,
  Menu as MenuIcon,
} from '@mui/icons-material';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const menuItems = [
  { text: 'Home', href: '/home', icon: <HomeIcon /> },
  { text: 'Orders', href: '/orders', icon: <ListAlt /> },
  { text: 'Scheduler', href: '/schedule', icon: <CalendarToday /> },
  { text: 'Map', href: '/map', icon: <MapIcon /> },
  { text: 'Clients', href: '/clients', icon: <Group /> },
  { text: 'Payments', href: '/payments', icon: <Payment /> },
  { text: 'Quotes', href: '/quotes', icon: <Description /> },
  { text: 'Invoices', href: '/invoices', icon: <CreditCard /> },
  { text: 'Reports', href: '/reports', icon: <Report /> },
  { text: 'Chat', href: '/chat', icon: <Chat /> },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();

  return (
    <div
      className={`bg-gradient-to-b from-gradientStart to-gradientEnd transition-all duration-300 fixed top-0 left-0 h-full z-20 ${isOpen ? 'w-64' : 'w-16'
        }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 p-1 bg-white rounded-full z-30"
      >
        <MenuIcon />
      </button>

      {/* Logo */}
      <div className="flex items-center justify-center mt-16 mb-6">
        {isOpen ? (
          <h1 className="text-white text-xl font-bold">TechTrack</h1>
        ) : (
          <div className="w-8 h-8 bg-white rounded-full"></div>
        )}
      </div>

      {/* Menu List */}
      <ul className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <li key={item.href} className="px-4">
            <Link href={item.href} legacyBehavior>
              <a
                className={`flex items-center p-2 rounded-md hover:bg-gradientApple-light transition-colors duration-200 ${pathname === item.href ? 'bg-gradientApple-dark' : ''
                  }`}
              >
                <span className="text-white">{item.icon}</span>
                {isOpen && (
                  <span className="ml-4 text-white whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.text}
                  </span>
                )}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;





