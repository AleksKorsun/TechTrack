'use client';

import React, { useState } from 'react';
import {
  Calendar as BigCalendar,
  Views,
  dateFnsLocalizer,
  Event as CalendarEvent,
  withDragAndDrop,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Modal, Box, TextField, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { addEvent } from '../store/eventsSlice'; // Допустим, у вас есть такой срез для событий
import { Event } from '../../types'; // Предполагается, что типы событий у вас определены здесь

// Импорт drag-and-drop компонента
const DragAndDropCalendar = withDragAndDrop(BigCalendar);

interface CalendarProps {
  events: Event[];
}

const locales = {
  'ru': ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Partial<Event> | null>(null);
  const [newEventData, setNewEventData] = useState<Partial<Event>>({});

  // Преобразование событий в формат, понятный для react-big-calendar
  const formattedEvents = events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));

  const handleSelectSlot = (slotInfo: any) => {
    setNewEventData({
      start: slotInfo.start.toISOString(),
      end: slotInfo.end.toISOString(),
      title: '',
    });
    setModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setEditEvent(event as Event); // Убедитесь, что типы совпадают
    setNewEventData({
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
    });
    setModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (editEvent) {
      // Обновление существующего события
      // Здесь можно добавить логику для обновления события через Redux
    } else {
      // Создание нового события
      dispatch(addEvent(newEventData));
    }
    setModalOpen(false);
    setEditEvent(null);
  };

  // Добавление обработки событий перетаскивания
  const handleEventResize = (data: any) => {
    const { event, start, end } = data;
    // Логика обновления события через Redux
  };

  const handleEventDrop = (data: any) => {
    const { event, start, end } = data;
    // Логика обновления события через Redux
  };

  // Определение ресурсов (например, техники)
  const resources = [
    { resourceId: 1, resourceTitle: 'Техник 1' },
    { resourceId: 2, resourceTitle: 'Техник 2' },
    // Добавьте другие ресурсы (техников)
  ];

  return (
    <div style={{ height: '80vh' }}>
      <DragAndDropCalendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        defaultView={Views.WEEK}
        views={{ month: true, week: true, day: true, agenda: true }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        resizable
        onEventResize={handleEventResize}
        onEventDrop={handleEventDrop}
        resources={resources}
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        messages={{
          next: 'След',
          previous: 'Пред',
          today: 'Сегодня',
          month: 'Месяц',
          week: 'Неделя',
          day: 'День',
          agenda: 'Повестка дня',
          date: 'Дата',
          time: 'Время',
          event: 'Событие',
        }}
      />

      {/* Модальное окно для создания/редактирования события */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box className="p-4 bg-white rounded" sx={{ margin: '100px auto', width: 400 }}>
          <h2>{editEvent ? 'Редактировать событие' : 'Новое событие'}</h2>
          <TextField
            label="Название"
            name="title"
            fullWidth
            margin="normal"
            value={newEventData.title || ''}
            onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
          />
          <TextField
            label="Дата начала"
            name="start"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={newEventData.start?.slice(0, 16) || ''}
            onChange={(e) => setNewEventData({ ...newEventData, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Дата окончания"
            name="end"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={newEventData.end?.slice(0, 16) || ''}
            onChange={(e) => setNewEventData({ ...newEventData, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleSaveEvent} className="mt-4">
            {editEvent ? 'Обновить' : 'Сохранить'}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Calendar;

