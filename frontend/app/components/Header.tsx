// app/components/Header.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
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
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
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

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(to right, #8B4513, #D2691E)', // Используйте ту же цветовую гамму, что и в футере
      }}
      elevation={1}
    >
      <Toolbar>
        {/* Логотип */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
          <Image src="/techtrack-logo.png" alt="TechTrack Logo" width={40} height={40} />
          <Typography variant="h6" sx={{ color: '#FFF', marginLeft: '8px' }}>
            TechTrack
          </Typography>
        </Box>

        {/* Иконки и меню */}
        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
            <Notifications />
          </IconButton>

          {/* Меню уведомлений */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={isNotificationMenuOpen}
            onClose={handleNotificationMenuClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleNotificationMenuClose}>No new notifications</MenuItem>
          </Menu>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircle />
          </IconButton>

          {/* Меню аккаунта */}
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { router.push('/profile'); handleMenuClose(); }}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>My account</MenuItem>
            <Divider />
            <MenuItem onClick={() => { router.push('/authentication/login'); handleMenuClose(); }}>Login</MenuItem>
            <MenuItem onClick={() => { router.push('/authentication/register'); handleMenuClose(); }}>Register</MenuItem>
          </Menu>

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
            <MenuItem onClick={handleSettingsClick}>Profile Settings</MenuItem>
            <MenuItem onClick={handleSettingsMenuClose}>App Settings</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;






