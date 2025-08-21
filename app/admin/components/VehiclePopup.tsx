'use client';

import { useState, useEffect } from 'react';
import { VEHICLE } from './api';
import toast, { Toaster } from 'react-hot-toast';
import { Vehicle } from './types';

interface VehiclePopupProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: Vehicle | null;
}

interface FormState {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  status: string;
}

interface FormErrors {
  make: string;
  model: string;
  year: string;
  plateNumber: string;
}

const STATUS: Vehicle['status'][] = ['Available', 'Assigned', 'Maintenance'];

const VehiclePopup: React.FC<VehiclePopupProps> = ({ open, onClose, onSaved, initial }) => {
  if (!open) return null;
  const isEdit = Boolean(initial);

  const [form, setForm] = useState<FormState>({
    make: initial?.make || '',
    model: initial?.model || '',
    year: initial?.year || new Date().getFullYear(),
    plateNumber: initial?.plateNumber || '',
    status: initial?.status || 'Available',
  });

  const [errors, setErrors] = useState<FormErrors>({
    make: '',
    model: '',
    year: '',
    plateNumber: '',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        make: initial.make,
        model: initial.model,
        year: initial.year,
        plateNumber: initial.plateNumber || '',
        status: initial.status || 'Available',
      });
    }
  }, [initial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = { make: '', model: '', year: '', plateNumber: '' };

    if (!form.make.trim()) { newErrors.make = 'Make is required'; isValid = false; }
    if (!form.model.trim()) { newErrors.model = 'Model is required'; isValid = false; }
    if (!form.year || form.year <= 0) { newErrors.year = 'Year is required'; isValid = false; }
    if (!form.plateNumber.trim()) { newErrors.plateNumber = 'Plate number is required'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    try {
      const body = { ...form };

      if (isEdit && initial?._id) {
        await VEHICLE.UPDATE(initial._id, body);
        toast.success('Vehicle updated successfully');
      } else {
        await VEHICLE.CREATE(body);
        toast.success('Vehicle created successfully');
      }

      onSaved();
      onClose();
    } catch (error: any) {
      if (error.message?.includes('409')) toast.error('Vehicle with this plate number already exists');
      else toast.error(`Error: ${error.message || 'Failed to save vehicle'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Toaster position="top-right" />
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">
          {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
        </h2>

        {['make', 'model', 'year', 'plateNumber'].map((field) => (
          <div key={field} className="mb-3">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {field === 'plateNumber' ? 'Plate Number' : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              name={field}
              type={field === 'year' ? 'number' : 'text'}
              placeholder={field}
              value={form[field as keyof FormState]}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 ${
                errors[field as keyof FormErrors] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors[field as keyof FormErrors] && (
              <p className="mt-1 text-sm text-red-500">{errors[field as keyof FormErrors]}</p>
            )}
          </div>
        ))}

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg bg-gray-200 px-4 py-2">
            Cancel
          </button>
          <button onClick={handleSubmit} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
            {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehiclePopup;
