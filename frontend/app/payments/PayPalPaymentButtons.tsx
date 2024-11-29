// payments/PayPalPaymentButtons.tsx

import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalPaymentButtonsProps {
  orderId: number;
  amount: number;
}

const PayPalPaymentButtons: React.FC<PayPalPaymentButtonsProps> = ({ orderId, amount }) => {
  const handleApprove = async (data: any, actions: any) => {
    // Захват заказа на стороне клиента
    const captureResult = await actions.order.capture();

    // Отправляем информацию о платеже на ваш бэкенд для сохранения и дальнейшей обработки
    const res = await fetch('/api/payments/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        orderId: data.orderID,
      }),
    });

    const result = await res.json();

    if (result.status === 'COMPLETED' || result.status === 'successful') {
      alert('Оплата через PayPal успешно проведена!');
      // Дополнительные действия после успешной оплаты
    } else {
      console.error('Ошибка при обработке платежа PayPal');
    }
  };

  return (
    <PayPalButtons
      createOrder={(data, actions) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: orderId.toString(),
              amount: {
                currency_code: 'USD',
                value: amount.toFixed(2),
              },
            },
          ],
        });
      }}
      onApprove={handleApprove}
    />
  );
};

export default PayPalPaymentButtons;


