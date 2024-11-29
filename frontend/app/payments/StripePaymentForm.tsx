// payments/StripePaymentForm.tsx

import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  orderId: number;
  amount: number;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ orderId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Запрос к вашему бэкенду для создания PaymentIntent
    const res = await fetch('/api/payments/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, order_id: orderId }),
    });

    const data = await res.json();

    if (data.detail) {
      console.error(data.detail);
      return;
    }

    const clientSecret = data.client_secret;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        alert('Оплата успешно проведена!');
        // Дополнительные действия после успешной оплаты
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Оплатить ${amount.toFixed(2)}
      </button>
    </form>
  );
};

export default StripePaymentForm;
