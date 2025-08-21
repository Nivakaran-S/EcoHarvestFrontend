// app/admin/components/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { InventoryItem, Vehicle } from './types';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
}

export const INVENTORY = {
  LIST: (): Promise<ApiResponse<InventoryItem[]>> => api.get('/inventory'),
  CREATE: (body: Omit<InventoryItem, '_id'>): Promise<ApiResponse<InventoryItem>> =>
    api.post('/inventory', body),
  UPDATE: (id: string, body: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> =>
    api.put(`/inventory/${id}`, body),
  DELETE: (id: string): Promise<ApiResponse<void>> => api.delete(`/inventory/${id}`),
};

export const VEHICLE = {
  LIST: (): Promise<ApiResponse<Vehicle[]>> => api.get('/vehicle'),
  CREATE: (body: Omit<Vehicle, '_id'>): Promise<ApiResponse<Vehicle>> =>
    api.post('/vehicle', body),
  UPDATE: (id: string, body: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> =>
    api.put(`/vehicle/${id}`, body),
  DELETE: (id: string): Promise<ApiResponse<void>> => api.delete(`/vehicle/${id}`),
};

export async function apiHandler<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
    throw { message: 'An unexpected error occurred' };
  }
}
