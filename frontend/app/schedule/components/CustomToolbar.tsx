//app/schedule/components/CustomToolbar.tsx

import React from 'react';
import { ToolbarProps, View } from 'react-big-calendar';
import { IconButton, Button } from '@mui/material';
import { ArrowBack, ArrowForward, Today } from '@mui/icons-material';

const CustomToolbar: React.FC<ToolbarProps> = (props) => {
  const goToBack = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const goToToday = () => {
    props.onNavigate('TODAY');
  };

  const label = props.label;

  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <IconButton onClick={goToBack}>
          <ArrowBack />
        </IconButton>
        <IconButton onClick={goToToday}>
          <Today />
        </IconButton>
        <IconButton onClick={goToNext}>
          <ArrowForward />
        </IconButton>
      </div>
      <span className="rbc-toolbar-label">{label}</span>
      <div className="rbc-btn-group">
        {Object.keys(props.views).map((view: string) => (
          <Button
            key={view}
            variant={props.view === view ? 'contained' : 'text'}
            onClick={() => props.onView(view as View)}
          >
            {view}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CustomToolbar;



