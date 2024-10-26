// app/clients/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Button, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import apiClient from '../utils/apiClient';
import { Client } from '../../types';
import { useRouter } from 'next/navigation';

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/clients/');
        setClients(response.data);
      } catch (error: any) {
        setError('Ошибка при получении списка клиентов');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleAddClient = () => {
    router.push('/clients/new');
  };

  const handleEditClient = (id: string) => {
    router.push(`/clients/${id}/edit`);
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        await apiClient.delete(`/clients/${id}/`);
        setClients(clients.filter((client) => client.id !== id));
      } catch (error: any) {
        setError('Ошибка при удалении клиента');
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Имя', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Телефон', width: 150 },
    { field: 'address', headerName: 'Адрес', width: 250 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleEditClient(params.row.id)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClient(params.row.id)}
          >
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
      <div style={{ height: 600, width: '100%', padding: '1rem' }}>
        <h1>Клиенты</h1>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddClient}
          style={{ marginBottom: '1rem' }}
        >
          Добавить клиента
        </Button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <DataGrid
          rows={clients}
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

export default ClientsPage;



