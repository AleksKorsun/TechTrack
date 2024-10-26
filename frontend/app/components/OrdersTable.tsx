'use client';

import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Order } from '../../types';
import { Button } from '@mui/material';
import axios from 'axios';


interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'clientName', headerName: 'Клиент', width: 200 },
    { field: 'phone', headerName: 'Телефон', width: 150 },
    { field: 'startDate', headerName: 'Дата начала', width: 150 },
    { field: 'status', headerName: 'Статус', width: 120 },
    { field: 'amount', headerName: 'Сумма', width: 100 },
    { field: 'paymentStatus', headerName: 'Оплата', width: 150 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <div>
          <Button
            variant="contained"
            size="small"
            style={{ marginRight: 8 }}
            onClick={() => handleEdit(params.row)}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            onClick={() => handleComplete(params.row)}
          >
            Завершить
          </Button>
        </div>
      ),
    },
  ];

  // Функции для обработки действий
  const handleEdit = (order: Order) => {
    // Логика редактирования заказа
  };

  const handleComplete = async (order: Order) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/orders/${order.id}/status`,
        { status: 'completed' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Обновите список заказов после изменения статуса
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
    }
  };

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid rows={orders} columns={columns} pageSizeOptions={[10]} />
    </div>
  );
};

export default OrdersTable;




