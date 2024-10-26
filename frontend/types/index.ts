// types/index.ts

export interface Technician {
  id: number;
  name: string;
  status: 'available' | 'busy' | 'active';
  latitude: number;
  longitude: number;
  // Добавьте другие необходимые поля при необходимости
}


export interface Order {
  id: number;
  clientName: string;
  phone: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'assigned';
  latitude: number;
  longitude: number;
  startDate: string; // или preferred_start_time, в зависимости от бэкенда
  amount: number;
  paymentStatus: 'Paid' | 'Overdue' | 'Pending';
  technicianId?: number;
  description?: string;
  // Добавьте другие поля, которые возвращает бэкенд
}
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  // Добавьте другие поля по необходимости
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: number;
  order_id: number;
  client_id: number;
  amount: number;
  due_date: string; // или Date
  tax?: number;
  discount?: number;
  notes?: string;
  status: string;
  created_at: string; // или Date
  items: InvoiceItem[];
  // Новые поля, которые вы используете в компоненте
  invoice_number: string;  // Если в бэкенде возвращается номер инвойса
  client_name: string;     // Имя клиента
  client_address: string;  // Адрес клиента
  client_phone: string;    // Телефон клиента
  service_description: string; // Описание услуги
  invoice_date: string;
}
export interface Service {
  itemType: string; // 'service' или 'material'
  itemId: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface EstimateItem {
  id?: number; // Optional if not assigned yet
  item_type: 'service' | 'material';
  item_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total?: number; // Calculated field
}

export interface Estimate {
  id?: number; // Optional if not assigned yet
  client_id: number;
  technician_id?: number;
  discount: number;
  tax: number;
  total?: number; // Calculated field
  status?: string; // Default to 'draft'
  created_at?: string; // Optional, set by backend
  updated_at?: string; // Optional, set by backend
  items: EstimateItem[];
}


export type PaymentStatus = 'paid' | 'unpaid' | 'overdue';

