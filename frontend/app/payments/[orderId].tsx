// payments/[orderId].tsx

import React from 'react';
import { useRouter } from 'next/router';
import PaymentForm from './PaymentForm';

const PaymentPage = () => {
  const router = useRouter();
  const { orderId } = router.query;

  // Здесь вы можете получить информацию о заказе и сумме к оплате с сервера или контекста
  const amount = 100.0; // Получите реальную сумму заказа

  if (!orderId) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h1>Оплата заказа #{orderId}</h1>
      <PaymentForm orderId={Number(orderId)} amount={amount} />
    </div>
  );
};

export default PaymentPage;
