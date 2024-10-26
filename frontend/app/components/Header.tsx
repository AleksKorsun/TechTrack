// app/components/Header.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Button,
  Box,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  Login,
  PersonAdd,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import apiClient from '../utils/apiClient';
import AccountMenu from './AccountMenu';
import NotificationsMenu from './NotificationsMenu';
import { Notification } from '../../types/notification'; // Импортируем интерфейс


interface HeaderProps {
  isSidebarOpen: boolean;
}




const Header: React.FC = () => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isNotificationMenuOpen = Boolean(notificationAnchorEl);
  const isSettingsMenuOpen = Boolean(settingsAnchorEl);

  const router = useRouter();

  // Обработчики для меню аккаунта
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Обработчики для меню уведомлений
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  // Обработчики для меню настроек
  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    handleSettingsMenuClose();
  };

  // Определяем роль пользователя
  const userRole = session?.user?.role;

  // Состояние для уведомлений
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/notifications/');
        setNotifications(response.data);
      } catch (error) {
        console.error('Ошибка при получении уведомлений:', error);
      }
    };

    if (session) {
      fetchNotifications();
    }
  }, [session]);

  return (
    <AppBar position="fixed" sx={{ background: 'linear-gradient(to right, #8B4513, #D2691E)' }} elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: '#FFF' }}>
          <Link href="/" passHref>
            <Button color="inherit">TechTrack</Button>
          </Link>
        </Typography>

        {session ? (
          <>
            {/* Навигационные ссылки */}
            <nav>
              <Box sx={{ display: 'flex', gap: '1rem', marginRight: 'auto' }}>
                <Link href="/" passHref>
                  <Button color="inherit">Главная</Button>
                </Link>
                {(userRole === 'admin' || userRole === 'dispatcher') && (
                  <>
                    <Link href="/orders" passHref>
                      <Button color="inherit">Заказы</Button>
                    </Link>
                    <Link href="/schedule" passHref>
                      <Button color="inherit">Планировщик</Button>
                    </Link>
                    {/* Добавьте остальные ссылки аналогично */}
                  </>
                )}
                {/* Аналогично для других ролей */}
              </Box>
            </nav>

            {/* Иконки и меню */}
            <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
              <Badge badgeContent={notifications.length} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>

            {/* Меню уведомлений */}
            <NotificationsMenu
              anchorEl={notificationAnchorEl}
              isOpen={isNotificationMenuOpen}
              onClose={handleNotificationMenuClose}
              notifications={notifications}
            />

            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>

            {/* Меню аккаунта */}
            <AccountMenu
              anchorEl={anchorEl}
              isOpen={isMenuOpen}
              onClose={handleMenuClose}
              userName={session.user.name || session.user.email || 'Профиль'}
            />

            <IconButton color="inherit" onClick={handleSettingsMenuOpen}>
              <Settings />
            </IconButton>

            {/* Меню настроек */}
            <Menu
              anchorEl={settingsAnchorEl}
              open={isSettingsMenuOpen}
              onClose={handleSettingsMenuClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleSettingsClick}>Настройки профиля</MenuItem>
              <MenuItem onClick={handleSettingsMenuClose}>Настройки приложения</MenuItem>
            </Menu>
          </>
        ) : (
          // Если пользователь не авторизован
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => signIn()}
            >
              Войти
            </Button>
            <Button
              color="inherit"
              startIcon={<PersonAdd />}
              component={Link}
              href="/register"
            >
              Регистрация
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;


