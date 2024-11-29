// components/MapSearch.tsx

'use client';

import React, { useState } from 'react';
import { TextField, IconButton } from '@mui/material';
import { Search } from '@mui/icons-material';

const MapSearch: React.FC = () => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // Реализуйте логику поиска
  };

  return (
    <div className="mb-4">
      <TextField
        label="Поиск"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton onClick={handleSearch}>
              <Search />
            </IconButton>
          ),
        }}
      />
    </div>
  );
};

export default MapSearch;

