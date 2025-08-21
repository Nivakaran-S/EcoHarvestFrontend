// app/admin/components/types.ts
export type Category = 'Resale' | 'Recycle' | 'Fertilizer';

export interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  plateNumber?: string;
  status?: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: Category;
  quantity: number;
  vendorName: string;
  price: number;
  vehicle?: Vehicle | string;
  status: string;
  dispatchedTime?: Date;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// types.ts
export interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}
