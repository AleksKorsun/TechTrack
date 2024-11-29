// app/quotes/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Estimate } from '../../types';

const QuotesListPage = () => {
  const [quotes, setQuotes] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch('/api/estimates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include authentication headers if necessary
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }

        const data: Estimate[] = await response.json();
        setQuotes(data);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Список квот</h2>
      <ul>
        {quotes.map((quote) => (
          <li key={quote.id}>
            <Link href={`/quotes/${quote.id}`}>
              Квота #{quote.id} для клиента {quote.client_id} на сумму {quote.total} руб.
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/quotes/new">Создать новую квоту</Link>
    </div>
  );
};

export default QuotesListPage;

