'use client';

import { useState, useEffect } from 'react';
import { VEHICLE } from './api';
import VehiclePopup from './VehiclePopup';
import ConfirmDialog from './ConfirmDialog';
import SearchBar from './SearchBar';
import Script from 'next/script';
import { PrinterIcon } from '@heroicons/react/24/solid';
import { generatePDF } from './pdfUtils';
import { Vehicle as VehicleType } from './types';

export default function Vehicle() {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleType[]>([]);
  const [popup, setPopup] = useState<{ open: boolean; initial: VehicleType | null }>({
    open: false,
    initial: null,
  });
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const load = async (): Promise<void> => {
    const { data } = await VEHICLE.LIST();
    // data is already VehicleType[]
    setVehicles(data as VehicleType[]);
    setFilteredVehicles(data as VehicleType[]);
  };


  useEffect(() => {
    load();
  }, []);

  const handleSearch = (searchTerm: string): void => {
    const filtered = vehicles.filter((vehicle) =>
      vehicle.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  };

  const remove = (id: string): void => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (confirmDialog.id) {
      await VEHICLE.DELETE(confirmDialog.id);
      load();
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleCancelDelete = (): void => {
    setConfirmDialog({ open: false, id: null });
  };

  const handlePrintPDF = (): void => {
    generatePDF('Vehicle-table', 'Vehicle.pdf');
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="beforeInteractive"
      />

      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrintPDF}
            aria-label="Print PDF"
            className="rounded-lg p-2 hover:bg-gray-200 transition"
          >
            <PrinterIcon className="w-5 h-5 text-black" />
          </button>
          <button
            onClick={() => setPopup({ open: true, initial: null })}
            className="rounded-lg bg-orange-600 px-4 py-2 text-white font-semibold"
          >
            + Add New Vehicle
          </button>
        </div>
      </div>

      <SearchBar placeholder="Search by plate number..." onSearch={handleSearch} />

      <div className="overflow-x-auto">
        <table id="Vehicle-table" className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Plate', 'Make', 'Model', 'Year', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-2 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredVehicles.map((v) => (
              <tr key={v._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{v.plateNumber}</td>
                <td className="px-4 py-2">{v.make}</td>
                <td className="px-4 py-2">{v.model}</td>
                <td className="px-4 py-2">{v.year}</td>
                <td className="px-4 py-2">{v.status}</td>
                <td className="px-4 py-2 flex gap-2 no-print">
                  <button
                    onClick={() => setPopup({ open: true, initial: v })}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(v._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <VehiclePopup
        open={popup.open}
        onClose={() => setPopup({ open: false, initial: null })}
        onSaved={load}
        initial={popup.initial}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this vehicle?"
      />
    </>
  );
}
