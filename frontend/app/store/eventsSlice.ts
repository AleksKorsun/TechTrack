// store/eventsSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Event } from '../../types';

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
  const response = await axios.get<Event[]>('/api/events');
  return response.data;
});

export const addEvent = createAsyncThunk('events/addEvent', async (eventData: Partial<Event>) => {
  const response = await axios.post<Event>('/api/events', eventData);
  return response.data;
});

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch events
    builder.addCase(fetchEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.loading = false;
      state.events = action.payload;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Ошибка при загрузке событий';
    });

    // Add event
    builder.addCase(addEvent.fulfilled, (state, action) => {
      state.events.push(action.payload);
    });
  },
});

export default eventsSlice.reducer;
