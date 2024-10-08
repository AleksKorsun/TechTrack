// app/orders/components/OrderTable.tsx
import React from 'react';

interface Order {
  id: number;
  customerName: string;
  date: string;
  status: string;
}

interface OrderTableProps {
  orders: Order[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border-collapse shadow-lg rounded-lg">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">ID</th>
            <th className="py-3 px-6 text-left">Клиент</th>
            <th className="py-3 px-6 text-left">Дата</th>
            <th className="py-3 px-6 text-left">Статус</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">{order.id}</td>
              <td className="py-3 px-6 text-left">{order.customerName}</td>
              <td className="py-3 px-6 text-left">{order.date}</td>
              <td className="py-3 px-6 text-left">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;

