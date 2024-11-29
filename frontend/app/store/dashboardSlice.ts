// store/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../utils/apiClient';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  }
);

interface DashboardData {
  newOrders: number;
  activeTechnicians: number;
  revenue: number;
  newClients: number;
  appointments: number;
  activityFeed: { id: number; message: string; timestamp: string }[];
  financialData: { month: string; revenue: number }[];
}

const initialState: { data: DashboardData; loading: boolean; error: string | null } = {
  data: {
    newOrders: 0,
    activeTechnicians: 0,
    revenue: 0,
    newClients: 0,
    appointments: 0,
    activityFeed: [],
    financialData: [],
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setVirtualDashboardData: (state, action: PayloadAction<DashboardData>) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unknown error';
      });
  },
});

export const { setVirtualDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;






