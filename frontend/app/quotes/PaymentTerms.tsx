// quotes/PaymentTerms.tsx

import React from 'react';

interface PaymentTermsProps {
  onChange: (terms: any) => void;
}

const PaymentTerms: React.FC<PaymentTermsProps> = ({ onChange }) => {
  const handleTermsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div>
      <h3>Условия оплаты</h3>
      <textarea
        name="terms"
        placeholder="Введите условия оплаты"
        onChange={handleTermsChange}
      />
      {/* Дополнительные поля для методов оплаты */}
    </div>
  );
};

export default PaymentTerms;

