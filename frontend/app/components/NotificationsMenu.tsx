// app/components/NotificationsMenu.tsx

'use client';

import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Notification } from '../../types/notification'; // Импортируем интерфейс

interface NotificationsMenuProps {
  anchorEl: null | HTMLElement;
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  anchorEl,
  isOpen,
  onClose,
  notifications,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {notifications.length === 0 ? (
        <MenuItem onClick={onClose}>Нет новых уведомлений</MenuItem>
      ) : (
        notifications.map((notification) => (
          <MenuItem key={notification.id} onClick={onClose}>
            {notification.message}
          </MenuItem>
        ))
      )}
    </Menu>
  );
};

export default NotificationsMenu;

