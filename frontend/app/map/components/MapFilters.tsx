
// components/MapFilters.tsx

'use client';

import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

interface MapFiltersProps {
  orderStatusFilter: string;
  setOrderStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  technicianStatusFilter: string;
  setTechnicianStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  startDateFilter: Dayjs | null;
  setStartDateFilter: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  endDateFilter: Dayjs | null;
  setEndDateFilter: React.Dispatch<React.SetStateAction<Dayjs | null>>;
}

const MapFilters: React.FC<MapFiltersProps> = ({
  orderStatusFilter,
  setOrderStatusFilter,
  technicianStatusFilter,
  setTechnicianStatusFilter,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
}) => {
  return (
    <div className="flex space-x-4 mb-4">
      {/* Фильтр по статусу заказа */}
      <TextField
        select
        label="Статус заказа"
        value={orderStatusFilter}
        onChange={(e) => setOrderStatusFilter(e.target.value)}
      >
        <MenuItem value="all">Все</MenuItem>
        <MenuItem value="new">Новые</MenuItem>
        <MenuItem value="in_progress">В работе</MenuItem>
        <MenuItem value="completed">Завершенные</MenuItem>
      </TextField>

      {/* Фильтр по статусу техника */}
      <TextField
        select
        label="Статус техника"
        value={technicianStatusFilter}
        onChange={(e) => setTechnicianStatusFilter(e.target.value)}
      >
        <MenuItem value="all">Все</MenuItem>
        <MenuItem value="available">Доступен</MenuItem>
        <MenuItem value="busy">Занят</MenuItem>
        <MenuItem value="inactive">Не активен</MenuItem>
      </TextField>

      {/* Фильтры по дате */}
      <DatePicker
        label="С даты"
        value={startDateFilter}
        onChange={(date: Dayjs | null) => setStartDateFilter(date)}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
      <DatePicker
        label="По дату"
        value={endDateFilter}
        onChange={(date: Dayjs | null) => setEndDateFilter(date)}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
    </div>
  );
};

export default MapFilters;





