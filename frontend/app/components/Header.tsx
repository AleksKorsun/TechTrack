// components/Header.tsx
'use client';

import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Badge } from '@mui/material';
import { Notifications, AccountCircle, Settings } from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar position="fixed" className="bg-gradient-to-r from-appleBrown-light to-appleBrown-dark ml-64" elevation={1}>
      <Toolbar>
        <Typography variant="h6" className="flex-grow text-ivory">
          TechTrack
        </Typography>
        <IconButton color="inherit">
          <Badge badgeContent={4} color="secondary">
            <Notifications />
          </Badge>
        </IconButton>
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
        <IconButton color="inherit">
          <Settings />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
