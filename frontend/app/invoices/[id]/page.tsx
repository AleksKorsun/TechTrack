// app/invoices/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Invoice } from '../../../types';
import apiClient from '../../utils/apiClient';
import { Button, Typography, Paper, Divider } from '@mui/material';

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await apiClient.get(`/invoices/${id}`);
        setInvoice(response.data);
      } catch (error: any) {
        setError('Ошибка при получении инвойса');
      }
    };

    fetchInvoice();
  }, [id]);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!invoice) {
    return <p>Загрузка...</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <Typography variant="h4">Инвойс #{invoice.invoice_number}</Typography> {/* Убедитесь, что invoice_number существует */}
      <Paper elevation={2} sx={{ padding: '1rem', marginTop: '1rem' }}>
        <Typography variant="h6">Информация о клиенте</Typography>
        <p>Имя: {invoice.client_name}</p> {/* Убедитесь, что client_name существует */}
        <p>Адрес: {invoice.client_address}</p> {/* Убедитесь, что client_address существует */}
        <p>Телефон: {invoice.client_phone}</p> {/* Убедитесь, что client_phone существует */}
        <Divider sx={{ marginY: '1rem' }} />
        <Typography variant="h6">Детали инвойса</Typography>
        <p>Услуга: {invoice.service_description}</p> {/* Убедитесь, что service_description существует */}
        <p>Дата инвойса: {invoice.invoice_date}</p> {/* Убедитесь, что invoice_date существует */}
        <p>Дата платежа: {invoice.due_date}</p> {/* Убедитесь, что due_date существует */}
        <p>Сумма: {invoice.amount}</p>
        <p>Статус: {invoice.status}</p>
        <p>Примечания: {invoice.notes}</p>
        <Divider sx={{ marginY: '1rem' }} />
        <Button variant="contained" color="primary" onClick={() => router.push(`/invoices/${id}/edit`)}>
          Редактировать
        </Button>
        {/* Добавьте кнопки для отправки по email, скачивания PDF, и маркировки как оплаченного */}
      </Paper>
    </div>
  );
};

export default InvoiceDetailsPage;

