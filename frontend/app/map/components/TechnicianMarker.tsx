// components/TechnicianMarker.tsx

import React from 'react';
import { PersonPinCircle } from '@mui/icons-material';

interface TechnicianMarkerProps {
  status: 'available' | 'busy' | 'active';
}

const TechnicianMarker: React.FC<TechnicianMarkerProps> = ({ status }) => {
  let color = 'gray';
  if (status === 'available') color = 'green';
  if (status === 'busy') color = 'red';
  if (status === 'active') color = 'orange';

  return <PersonPinCircle style={{ color, fontSize: 30 }} />;
};

export default TechnicianMarker;


