'use client';

import { useState, useEffect } from 'react';
import { INVENTORY, VEHICLE } from './api';
import ProductPopup from './ProductPopup';
import ConfirmDialog from './ConfirmDialog';
import SearchBar from './SearchBar';
import { generatePDF } from './pdfUtils';
import Script from 'next/script';
import { PrinterIcon } from '@heroicons/react/24/solid';
import { InventoryItem, Vehicle } from './types';

export default function Products() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [popup, setPopup] = useState<{ open: boolean; initial: InventoryItem | null }>({
    open: false,
    initial: null,
  });
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  // Load inventory from API
  const load = async (): Promise<void> => {
    const { data } = await INVENTORY.LIST();
    setItems(data as InventoryItem[]);
    setFilteredItems(data as InventoryItem[]);
  };

  useEffect(() => {
    load();
  }, []);

  // Search by name
  const handleSearch = (searchTerm: string) => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  // Delete flow
  const remove = (id: string) => setConfirmDialog({ open: true, id });

  const handleConfirmDelete = async () => {
    if (confirmDialog.id) {
      await INVENTORY.DELETE(confirmDialog.id);
      load();
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleCancelDelete = () => setConfirmDialog({ open: false, id: null });

  // Dispatch item
  const dispatchItem = async (prod: InventoryItem) => {
    if (!prod.vehicle || typeof prod.vehicle === 'string') {
      alert('Assign a vehicle first');
      return;
    }

    await INVENTORY.UPDATE(prod._id, {
      status: 'Dispatched',
      dispatchedTime: new Date(),
    });

    // Only update status of vehicle
    if (typeof prod.vehicle === 'object') {
      await VEHICLE.UPDATE(prod.vehicle._id, {
        status: 'Assigned',
      });
    }

    load();
  };

  // Print PDF
  const handlePrintPDF = () => generatePDF('products-table', 'products.pdf');

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
        <h1 className="text-2xl font-semibold">Inventory Products</h1>
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
            + Add New Inventory
          </button>
        </div>
      </div>

      <SearchBar placeholder="Search by product name..." onSearch={handleSearch} />

      <div className="overflow-x-auto">
        <table id="products-table" className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Product', 'Category', 'Price', 'Qty', 'Vendor', 'Vehicle', 'Status', ''].map(
                h => (
                  <th key={h} className="px-4 py-2 text-left font-medium">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems.map(it => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{it.name}</td>
                <td className="px-4 py-2">{it.category}</td>
                <td className="px-4 py-2">{it.price}</td>
                <td className="px-4 py-2">{it.quantity}</td>
                <td className="px-4 py-2">{it.vendorName}</td>
                <td className="px-4 py-2">
                  {typeof it.vehicle === 'object'
                    ? it.vehicle.plateNumber ?? `${it.vehicle.make} ${it.vehicle.model}`
                    : '—'}
                </td>
                <td className="px-4 py-2">{it.status}</td>
                <td className="px-4 py-2 flex gap-2 no-print">
                  <button
                    onClick={() => setPopup({ open: true, initial: it })}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(it._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                  {it.status === 'Active' && (
                    <button
                      onClick={() => dispatchItem(it)}
                      className="text-green-600 hover:underline"
                    >
                      Dispatch
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductPopup
        open={popup.open}
        onClose={() => setPopup({ open: false, initial: null })}
        onSaved={load}
        initial={popup.initial || undefined}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this product?"
      />
    </>
  );
}
