'use client';
import { useState, useEffect } from 'react';
import { Vehicle, InventoryItem, ApiError } from './types';
import { VEHICLE, INVENTORY, apiHandler } from './api';
import toast, { Toaster } from 'react-hot-toast';

interface ProductPopupProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: InventoryItem | null;
}

interface FormValues {
  name: string;
  price: number;
  category: InventoryItem['category'];
  quantity: number;
  vendorName: string;
  vehicle?: string;
}

interface FormErrors {
  name: string;
  price: string;
  quantity: string;
  vendorName: string;
  vehicle: string;
  category: string;
}

const ProductPopup: React.FC<ProductPopupProps> = ({ open, onClose, onSaved, initial }) => {
  if (!open) return null;

  const isEdit = Boolean(initial);

  const [form, setForm] = useState<FormValues>({
    name: initial?.name ?? '',
    price: initial?.price ?? 0,
    category: initial?.category ?? 'Resale',
    quantity: initial?.quantity ?? 0,
    vendorName: initial?.vendorName ?? '',
    vehicle: typeof initial?.vehicle === 'object' ? initial.vehicle._id : initial?.vehicle ?? '',
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    price: '',
    quantity: '',
    vendorName: '',
    vehicle: '',
    category: '',
  });

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data: Vehicle[] = await apiHandler(VEHICLE.LIST());
        setVehicles(data.filter((v) => v.status === 'Available'));
      } catch {
        toast.error('Failed to load vehicles');
      }
    };
    loadVehicles();
  }, []);

  // Prefill form when editing
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        price: initial.price,
        category: initial.category,
        quantity: initial.quantity,
        vendorName: initial.vendorName,
        vehicle: typeof initial.vehicle === 'object' ? initial.vehicle._id : initial.vehicle,
      });
    }
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: !form.name.trim() ? 'Product name is required' : '',
      price: !form.price || form.price <= 0 ? 'Price must be positive' : '',
      quantity: !form.quantity || form.quantity <= 0 ? 'Quantity must be positive' : '',
      vendorName: !form.vendorName.trim() ? 'Vendor name is required' : '',
      vehicle: !form.vehicle ? 'Vehicle selection is required' : '',
      category: !form.category ? 'Category selection is required' : '',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Please fix the errors in the form');
    return;
  }

  try {
    if (isEdit && initial?._id) {
      // Update existing inventory
      await apiHandler(INVENTORY.UPDATE(initial._id, form));
      toast.success('Product updated successfully');
    } else {
      // Create new inventory
      const newItem = {
        ...form,
        status: 'Active', // Add default status
      };
      await apiHandler(INVENTORY.CREATE(newItem));
      toast.success('Product created successfully');
    }
    onSaved();
    onClose();
  } catch (error) {
    const apiError = error as ApiError;
    toast.error(apiError.message || 'Failed to save product');
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Toaster position="top-right" />
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">{isEdit ? 'Edit Product' : 'Add Product'}</h2>

        {/* Render form inputs here (name, price, category, quantity, vendorName, vehicle) */}
        {/* Example: Product Name */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Repeat similar blocks for price, category, quantity, vendorName, vehicle */}
        {/* Vehicle */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Vehicle</label>
          <select
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 ${errors.vehicle ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.make} {v.model} ({v.year})
              </option>
            ))}
          </select>
          {errors.vehicle && <p className="mt-1 text-sm text-red-500">{errors.vehicle}</p>}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">Cancel</button>
          <button onClick={handleSubmit} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{isEdit ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPopup;
