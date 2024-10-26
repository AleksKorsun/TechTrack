// components/AddOrder.tsx
'use client';

import React, { useState } from 'react';
import { Modal, Box, TextField, Button, MenuItem } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { addOrder } from '../store/ordersSlice';
import { Order } from '../../types';  // Не забудьте импортировать тип Order

const AddOrder = () => {
  const [open, setOpen] = useState(false);
  const [orderData, setOrderData] = useState<Partial<Order>>({
    name: '',
    clientName: '',
    phone: '',
    startDate: '',
    status: 'Новый',
    amount: 0,
    paymentStatus: 'Ожидает оплаты', // Приводим к допустимому значению
  });

  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    dispatch(addOrder(orderData));
    setOpen(false);
  };

  return (
    <div className="mb-4">
      <Button variant="contained" onClick={() => setOpen(true)}>
        Создать новый заказ
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="p-4 bg-white rounded" sx={{ margin: '100px auto', width: 400 }}>
          <h2>Новый заказ</h2>
          <TextField label="Название" name="name" fullWidth margin="normal" onChange={handleChange} />
          <TextField label="Клиент" name="clientName" fullWidth margin="normal" onChange={handleChange} />
          <TextField label="Телефон" name="phone" fullWidth margin="normal" onChange={handleChange} />
          <TextField
            label="Дата начала"
            name="startDate"
            type="date"
            fullWidth
            margin="normal"
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Статус"
            name="status"
            select
            fullWidth
            margin="normal"
            value={orderData.status}
            onChange={handleChange}
          >
            <MenuItem value="Новый">Новый</MenuItem>
            <MenuItem value="В работе">В работе</MenuItem>
            <MenuItem value="Завершен">Завершен</MenuItem>
          </TextField>
          <TextField
            label="Сумма"
            name="amount"
            type="number"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            label="Статус оплаты"
            name="paymentStatus"
            select
            fullWidth
            margin="normal"
            value={orderData.paymentStatus}
            onChange={handleChange}
          >
            <MenuItem value="Ожидает оплаты">Ожидает оплаты</MenuItem>
            <MenuItem value="Оплачено">Оплачено</MenuItem>
            <MenuItem value="Просрочено">Просрочено</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleSubmit} className="mt-4">
            Сохранить
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default AddOrder;
