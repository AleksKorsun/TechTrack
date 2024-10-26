// app/invoices/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Button, IconButton, TextField, MenuItem } from '@mui/material';
import { Add, Edit, Delete, Email, Download, CheckCircle } from '@mui/icons-material';
import apiClient from '../utils/apiClient';
import { useRouter } from 'next/navigation';
import { Invoice, PaymentStatus } from '../../types';
import { Visibility } from '@mui/icons-material';


const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    clientName: '',
    invoiceNumber: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/invoices/', { params: filters });
      setInvoices(response.data);
    } catch (error: any) {
      setError('Ошибка при получении списка инвойсов');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchInvoices();
  };

  const handleClearFilters = () => {
    setFilters({ status: '', clientName: '', invoiceNumber: '' });
    fetchInvoices();
  };

  const handleEditInvoice = (id: number) => {
    router.push(`/invoices/${id}/edit`);
  };

  const handleViewInvoice = (id: number) => {
    router.push(`/invoices/${id}`);
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await apiClient.put(`/invoices/${id}/mark_paid`);
      fetchInvoices();
    } catch (error: any) {
      setError('Ошибка при обновлении статуса инвойса');
    }
  };

  const columns: GridColDef[] = [
    { field: 'invoice_number', headerName: 'Номер инвойса', width: 150 },
    { field: 'client_name', headerName: 'Имя клиента', width: 200 },
    { field: 'service_description', headerName: 'Услуга', width: 200 },
    { field: 'invoice_date', headerName: 'Дата инвойса', width: 150 },
    { field: 'due_date', headerName: 'Дата платежа', width: 150 },
    { field: 'amount', headerName: 'Сумма', width: 100 },
    { field: 'status', headerName: 'Статус платежа', width: 150 },
    { field: 'technician_name', headerName: 'Техник', width: 150 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleViewInvoice(params.row.id)}>
            <Visibility />
          </IconButton>
          <IconButton color="primary" onClick={() => handleEditInvoice(params.row.id)}>
            <Edit />
          </IconButton>
          <IconButton color="success" onClick={() => handleMarkAsPaid(params.row.id)}>
            <CheckCircle />
          </IconButton>
          {/* Добавьте кнопки для отправки по email и скачивания PDF */}
        </>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'client']}>
      <div style={{ height: 600, width: '100%', padding: '1rem' }}>
        <h1>Инвойсы</h1>

        {/* Фильтры */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <TextField
            label="Статус"
            name="status"
            select
            value={filters.status}
            onChange={handleFilterChange}
            variant="outlined"
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="Paid">Оплачен</MenuItem>
            <MenuItem value="Pending">Ожидается</MenuItem>
            <MenuItem value="Overdue">Просрочен</MenuItem>
          </TextField>
          <TextField
            label="Имя клиента"
            name="clientName"
            value={filters.clientName}
            onChange={handleFilterChange}
            variant="outlined"
          />
          <TextField
            label="Номер инвойса"
            name="invoiceNumber"
            value={filters.invoiceNumber}
            onChange={handleFilterChange}
            variant="outlined"
          />
          <Button variant="contained" onClick={handleApplyFilters}>
            Применить
          </Button>
          <Button variant="outlined" onClick={handleClearFilters}>
            Сбросить
          </Button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <DataGrid
          rows={invoices}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
          autoHeight
        />
      </div>
    </ProtectedRoute>
  );
};

export default InvoicesPage;

