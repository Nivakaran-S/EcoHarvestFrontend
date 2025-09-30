// types.ts
export interface Product {
  _id: string;
  name: string;
  subtitle?: string;
  quantity: number;
  unitPrice: number;
  MRP: number;
  category: string;
  imageUrl: string;
  vendorId: string;
  imageSrc?: string;
  price?: number;
  oldPrice?: number;
  status?: string;
}
