//app/layout.tsx

'use client';

import '../styles/globals.css';
import { Providers } from './providers/providers';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './authentication/context/AuthContext'; // Импортируем AuthProvider

const Sidebar = dynamic(() => import('./components/Sidebar'), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Проверяем, находится ли текущий путь внутри '/authentication'
  const isAuthPage = pathname ? pathname.startsWith('/authentication') : false;

  return (
    <html lang="ru">
      <head>
        <title>TechTrack</title>
      </head>
      <body>
        <AuthProvider>
          <Providers>
            {!isAuthPage && (
              <>
                <Header />
                <Sidebar
                  isOpen={isSidebarOpen}
                  toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                />
              </>
            )}
            <div className={`content ${isSidebarOpen && !isAuthPage ? 'ml-64' : 'ml-16'} min-h-screen`}>
              {children}
            </div>
            {!isAuthPage && <Footer />}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}

