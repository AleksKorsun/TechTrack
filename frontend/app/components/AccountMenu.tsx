// app/components/AccountMenu.tsx

'use client';

import React from 'react';
import { Menu, MenuItem, Divider } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAuth } from '../authentication/context/AuthContext';

interface AccountMenuProps {
  anchorEl: null | HTMLElement;
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const AccountMenu: React.FC<AccountMenuProps> = ({ anchorEl, isOpen, onClose, userName }) => {
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={onClose}>{userName}</MenuItem>
      <Divider />
      <MenuItem onClick={handleSignOut}>
        <Logout sx={{ marginRight: '0.5rem' }} /> Выйти
      </MenuItem>
    </Menu>
  );
};

export default AccountMenu;



