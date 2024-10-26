// app/layout.tsx

'use client';

import '../styles/globals.css';
import { Providers } from './providers/providers';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

const Sidebar = dynamic(() => import('./components/Sidebar'), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="ru">
      <head>
        <title>TechTrack</title>
      </head>
      <body>
        <Providers>
          <Header />
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          />
          <div className={`content ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

