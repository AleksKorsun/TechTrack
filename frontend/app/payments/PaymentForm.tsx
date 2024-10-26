// payments/PaymentForm.tsx

import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import StripePaymentForm from './StripePaymentForm';
import PayPalPaymentButtons from './PayPalPaymentButtons';
import { Container, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const stripePromise = loadStripe('ВАШ_STRIPE_PUBLIC_KEY');

interface PaymentFormProps {
  orderId: number;
  amount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ orderId, amount }) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Оплата заказа #{orderId}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Сумма к оплате: ${amount.toFixed(2)}
      </Typography>

      <RadioGroup
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'paypal')}
        row
      >
        <FormControlLabel value="stripe" control={<Radio />} label="Оплата картой (Stripe)" />
        <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
      </RadioGroup>

      {paymentMethod === 'stripe' && (
        <Elements stripe={stripePromise}>
          <StripePaymentForm orderId={orderId} amount={amount} />
        </Elements>
      )}

      {paymentMethod === 'paypal' && (
        <PayPalScriptProvider options={{ clientId: 'ВАШ_PAYPAL_CLIENT_ID' }}>
          <PayPalPaymentButtons orderId={orderId} amount={amount} />
        </PayPalScriptProvider>
      )}
    </Container>
  );
};

export default PaymentForm;


