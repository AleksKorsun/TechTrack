// components/OrderMarker.tsx

import React from 'react';
import { Room } from '@mui/icons-material';

interface OrderMarkerProps {
  status: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'assigned';
}

const OrderMarker: React.FC<OrderMarkerProps> = ({ status }) => {
  let color = 'blue';
  if (status === 'new') color = 'blue';
  if (status === 'in_progress') color = 'orange';
  if (status === 'completed') color = 'green';

  return <Room style={{ color, fontSize: 30 }} />;
};

export default OrderMarker;
