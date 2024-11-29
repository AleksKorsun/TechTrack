import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import {
  DateSelectArg,
  EventClickArg,
  EventDropArg
} from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Box, TextField, Button, Snackbar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchEvents, addEvent, updateEvent } from '../../store/eventsSlice';
import { Event, Technician } from '../../../types';
import axios from 'axios';

const Calendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events } = useSelector((state: RootState) => state.events);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [newEventData, setNewEventData] = useState<Partial<Event>>({});
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    // Получение списка техников
    axios
      .get<Technician[]>('/technicians/')
      .then((response) => setTechnicians(response.data))
      .catch((error) => console.error('Error fetching technicians:', error));
  }, []);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const formattedEvents = events.map((event) => ({
    ...event,
    id: event.id.toString(), // Преобразование id в строку
    start: new Date(event.start), // Преобразование start в объект Date
    end: new Date(event.end), // Преобразование end в объект Date
  }));

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setNewEventData({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      title: '',
    });
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find((e) => e.id === Number(clickInfo.event.id));
    if (event) {
      setEditEvent(event);
      setNewEventData({ ...event });
      setModalOpen(true);
    }
  };

  const handleEventDrop = (changeInfo: EventDropArg) => {
    const updatedEvent = {
      ...events.find((e) => e.id === Number(changeInfo.event.id)),
      start: changeInfo.event.startStr,
      end: changeInfo.event.endStr,
    };
    dispatch(updateEvent(updatedEvent as Event));
  };

  const handleSaveEvent = () => {
    if (editEvent && editEvent.id) {
      dispatch(updateEvent({ ...newEventData, id: editEvent.id } as Event));
    } else {
      dispatch(addEvent(newEventData as Event));
    }
    setModalOpen(false);
    setEditEvent(null);
    setSnackbarOpen(true);
  };

  const filteredEvents = formattedEvents.filter((event) => {
    return selectedTechnician ? event.technicianId === selectedTechnician : true;
  });

  return (
    <div style={{ height: '80vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Фильтр по технику"
          name="filterTechnician"
          select
          value={selectedTechnician !== null ? selectedTechnician.toString() : ''}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedTechnician(value ? Number(value) : null);
          }}
          SelectProps={{ native: true }}
          style={{ minWidth: 200, marginRight: 16 }}
        >
          <option value="">Все техники</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.name}
            </option>
          ))}
        </TextField>
      </Box>

      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        events={filteredEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth',
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ margin: '100px auto', width: 400, backgroundColor: '#fff', padding: 2 }}>
          <h2>{editEvent ? 'Редактировать событие' : 'Новое событие'}</h2>
          <TextField
            label="Заголовок"
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
            value={newEventData.start ? newEventData.start.toString().slice(0, 16) : ''}
            onChange={(e) => setNewEventData({ ...newEventData, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Дата окончания"
            name="end"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={newEventData.end ? newEventData.end.toString().slice(0, 16) : ''}
            onChange={(e) => setNewEventData({ ...newEventData, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Техник"
            name="technicianId"
            select
            fullWidth
            margin="normal"
            value={newEventData.technicianId !== undefined ? newEventData.technicianId.toString() : ''}
            onChange={(e) =>
              setNewEventData({ ...newEventData, technicianId: Number(e.target.value) })
            }
            SelectProps={{ native: true }}
          >
            <option value="">Выберите техника</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </TextField>

          <Button variant="contained" onClick={handleSaveEvent} sx={{ mt: 2 }}>
            {editEvent ? 'Обновить' : 'Сохранить'}
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="Событие успешно сохранено!"
      />
    </div>
  );
};

export default Calendar;










