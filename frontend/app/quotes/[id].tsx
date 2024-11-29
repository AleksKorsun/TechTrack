// app/quotes/[id]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Estimate } from '../../types';

const QuoteDetailPage = () => {
  const params = useParams(); // Используем useParams для получения id
  const id = params?.id as string; // Параметр из URL
  const [quote, setQuote] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      const fetchQuote = async () => {
        try {
          const response = await fetch(`/api/estimates/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // Добавьте заголовки для авторизации, если нужно
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch quote');
          }

          const data: Estimate = await response.json();
          setQuote(data);
        } catch (error) {
          console.error('Error fetching quote:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchQuote();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!quote) {
    return <div>Quote not found</div>;
  }

  return (
    <div>
      <h2>Quote Details #{quote.id}</h2>
      <p>Client ID: {quote.client_id}</p>
      <p>Technician ID: {quote.technician_id}</p>
      <p>Status: {quote.status}</p>
      <h3>Items:</h3>
      <ul>
        {quote.items.map((item) => (
          <li key={item.id}>
            {item.description} — {item.quantity} × {item.unit_price} USD = {item.total} USD
          </li>
        ))}
      </ul>
      <p>Total Amount: {quote.total} USD</p>
    </div>
  );
};

export default QuoteDetailPage;


