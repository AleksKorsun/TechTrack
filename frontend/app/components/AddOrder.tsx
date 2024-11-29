// components/AddOrder.tsx
import React, { useState } from 'react';
import { Modal, Box, TextField, Button, MenuItem } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { addOrder } from '../store/ordersSlice';
import { Order } from '../../types';

const statusOptions = {
  new: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  assigned: 'Assigned'
};

const paymentStatusOptions = {
  Pending: 'Pending',
  Paid: 'Paid',
  Overdue: 'Overdue'
};

const AddOrder = () => {
  const [open, setOpen] = useState(false);
  const [orderData, setOrderData] = useState<Partial<Order>>({
    name: '',
    clientName: '',
    phone: '',
    startDate: '',
    status: 'new',
    amount: 0,
    paymentStatus: 'Pending',
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
        Create New Order
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="p-4 bg-white rounded" sx={{ margin: '100px auto', width: 400 }}>
          <h2>New Order</h2>
          <TextField label="Order Name" name="name" fullWidth margin="normal" onChange={handleChange} />
          <TextField label="Client" name="clientName" fullWidth margin="normal" onChange={handleChange} />
          <TextField label="Phone" name="phone" fullWidth margin="normal" onChange={handleChange} />
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            fullWidth
            margin="normal"
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Status"
            name="status"
            select
            fullWidth
            margin="normal"
            value={orderData.status}
            onChange={handleChange}
          >
            {Object.entries(statusOptions).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Amount"
            name="amount"
            type="number"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            label="Payment Status"
            name="paymentStatus"
            select
            fullWidth
            margin="normal"
            value={orderData.paymentStatus}
            onChange={handleChange}
          >
            {Object.entries(paymentStatusOptions).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={handleSubmit} className="mt-4">
            Save
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default AddOrder;


