// pages/quotes/index.tsx

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Estimate } from '../../types'; // Предполагается, что интерфейсы находятся в файле types.ts

const QuotesListPage = () => {
  // Указываем тип Estimate для состояния estimates
  const [estimates, setEstimates] = useState<Estimate[]>([]);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        // Получаем данные из API и сохраняем их в state
        const response = await axios.get<Estimate[]>('/api/estimates');
        setEstimates(response.data);
      } catch (error) {
        console.error('Error loading estimates:', error);
      }
    };
    fetchEstimates();
  }, []);

  return (
    <div>
      <h2>Estimates List</h2>
      <ul>
        {estimates.map((estimate) => (
          <li key={estimate.id}>
            <Link href={`/quotes/${estimate.id}`}>
              Estimate #{estimate.id} for client ID {estimate.client_id}, total amount: {estimate.total} USD
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/quotes/new">Create New Estimate</Link>
    </div>
  );
};

export default QuotesListPage;

