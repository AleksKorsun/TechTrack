// app/store/techniciansSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getTechnicians } from '../services/technicianService';
import { Technician } from '../../types';
import axiosInstance from '../utils/axiosInstance';

interface TechniciansState {
  technicians: Technician[];
  loading: boolean;
  error: string | null;
}

const initialState: TechniciansState = {
  technicians: [],
  loading: false,
  error: null,
};

// Обновление с использованием сервиса
export const fetchTechnicians = createAsyncThunk<Technician[], any>(
  'technicians/fetchTechnicians',
  async (params = {}) => {
    const response = await axiosInstance.get<Technician[]>('/technicians', { params });
    return response.data;
  }
);


const techniciansSlice = createSlice({
  name: 'technicians',
  initialState,
  reducers: {
    updateTechnicianStateLocally(state, action: PayloadAction<Technician>) {
      const index = state.technicians.findIndex((tech) => tech.id === action.payload.id);
      if (index !== -1) {
        state.technicians[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTechnicians.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchTechnicians.fulfilled, (state, action) => {
      state.loading = false;
      state.technicians = action.payload;
    });
    builder.addCase(fetchTechnicians.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Ошибка при загрузке техников';
    });
  },
});

export const { updateTechnicianStateLocally } = techniciansSlice.actions;

export default techniciansSlice.reducer;

