// app/reports/components/EmployeePerformance.tsx

'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient'; // Замените на корректный путь
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Line } from 'react-chartjs-2';

// Определение типов для данных сотрудника
interface EmployeePerformanceData {
  task_id: number;
  task_name: string;
  status: string;
  completion_time: string;
  date: string;
  average_completion_time: number;
}

interface Employee {
  id: string;
  name: string;
}

const EmployeePerformance = () => {
  const [data, setData] = useState<EmployeePerformanceData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('last_month');

  useEffect(() => {
    // Получение списка сотрудников
    apiClient
      .get('/api/employees')
      .then((response) => setEmployees(response.data))
      .catch((error) => console.error(error));

    // Получение данных производительности
    apiClient
      .get('/api/reports/employee-performance', {
        params: {
          employee_id: selectedEmployee,
          date_range: dateRange,
        },
      })
      .then((response) => setData(response.data))
      .catch((error) => console.error(error));
  }, [selectedEmployee, dateRange]);

  const columns: GridColDef[] = [
    { field: 'task_id', headerName: 'ID задачи', width: 100 },
    { field: 'task_name', headerName: 'Название задачи', width: 200 },
    { field: 'status', headerName: 'Статус', width: 150 },
    { field: 'completion_time', headerName: 'Время выполнения', width: 200 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Производительность сотрудников</Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <FormControl>
          <InputLabel id="employee-label">Сотрудник</InputLabel>
          <Select
            labelId="employee-label"
            value={selectedEmployee}
            label="Сотрудник"
            onChange={(e) => setSelectedEmployee(e.target.value as string)}
          >
            <MenuItem value="">
              <em>Все</em>
            </MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="date-range-label">Период</InputLabel>
          <Select
            labelId="date-range-label"
            value={dateRange}
            label="Период"
            onChange={(e) => setDateRange(e.target.value as string)}
          >
            <MenuItem value="last_week">Последняя неделя</MenuItem>
            <MenuItem value="last_month">Последний месяц</MenuItem>
            <MenuItem value="last_quarter">Последний квартал</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ height: 400, mt: 2 }}>
        <DataGrid
          rows={data}
          columns={columns}
          paginationModel={{ pageSize: 5, page: 0 }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Среднее время выполнения задач</Typography>
        <Line
          data={{
            labels: data.map((item) => item.date),
            datasets: [
              {
                label: 'Время выполнения (часы)',
                data: data.map((item) => item.average_completion_time),
                fill: false,
                backgroundColor: 'blue',
                borderColor: 'blue',
              },
            ],
          }}
        />
      </Box>
    </Box>
  );
};

export default EmployeePerformance;

