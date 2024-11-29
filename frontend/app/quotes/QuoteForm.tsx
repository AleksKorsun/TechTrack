import React, { useState } from 'react';
import ClientDetailsForm from './ClientDetailsForm';
import ServiceList from './ServiceList';
import PaymentTerms from './PaymentTerms';
import SignaturePad from './SignaturePad';
import TotalSummary from './TotalSummary';

interface ClientDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Service {
  itemType: string; // 'service' или 'material'
  itemId: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

const QuoteForm: React.FC = () => {
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [serviceDate, setServiceDate] = useState<string>(''); // Добавлено: Дата выполнения работы
  const [dueDate, setDueDate] = useState<string>(''); // Добавлено: Дата оплаты
  const [jobNumber, setJobNumber] = useState<string>(''); // Добавлено: Номер работы (job number)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!clientDetails) {
      alert('Please select a client.');
      return;
    }

    if (services.length === 0) {
      alert('Please add at least one service or product.');
      return;
    }

    const payload = {
      client_id: clientDetails.id,
      discount: discount,
      tax: tax,
      service_date: serviceDate, // Добавлено: Дата выполнения работы
      due_date: dueDate, // Добавлено: Дата оплаты
      job_number: jobNumber, // Добавлено: Номер работы
      items: services.map((service) => ({
        item_type: service.itemType,
        item_id: service.itemId,
        description: service.description,
        quantity: service.quantity,
        unit_price: service.unitPrice,
      })),
    };

    try {
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      // Обработка успешного создания сметы
      console.log('Estimate successfully created:', data);
    } catch (error) {
      console.error('Error creating estimate:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Estimate</h2>
      <ClientDetailsForm onChange={setClientDetails} />
      <ServiceList services={services} setServices={setServices} />
      <TotalSummary services={services} discount={discount} tax={tax} />
      <div>
        <label>Service Date</label>
        <input
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Job Number</label>
        <input
          type="text"
          value={jobNumber}
          onChange={(e) => setJobNumber(e.target.value)}
          placeholder="Enter Job Number"
        />
      </div>
      <PaymentTerms onChange={setPaymentTerms} />
      <SignaturePad onChange={setSignature} />
      <button type="submit">Submit Estimate</button>
    </form>
  );
};

export default QuoteForm;


