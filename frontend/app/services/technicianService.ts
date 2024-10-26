// services/technicianService.ts
import axiosInstance from '../utils/axiosInstance';
import { Technician } from '../../types';

export const getTechnicians = async (params = {}): Promise<Technician[]> => {
  const response = await axiosInstance.get<Technician[]>('/technicians', { params });
  return response.data;
};
