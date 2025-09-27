
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Select, { SingleValue } from "react-select";
import Swal from "sweetalert2";
import { 
  PencilIcon, 
  TrashIcon, 
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// ===== Base URL =====
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// Interfaces
interface Product {
  _id: string;
  name: string;
  category: string;
  unitPrice: number;
}

interface Discount {
  _id: string;
  productId: Product;
  percentage: number;
  status: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectedColumns {
  productName: boolean;
  category: boolean;
  originalPrice: boolean;
  discount: boolean;
  currentPrice: boolean;
  status: boolean;
}

const DiscountsPage: React.FC = () => {
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>({
    productName: true,
    category: true,
    originalPrice: true,
    discount: true,
    currentPrice: true,
    status: true,
  });

  // PDF generation
  const generatePDF = (): void => {
    const doc = new jsPDF();
    const tableColumn: string[] = [];
    if (selectedColumns.productName) tableColumn.push("Product Name");
    if (selectedColumns.category) tableColumn.push("Category");
    if (selectedColumns.originalPrice) tableColumn.push("Original Price");
    if (selectedColumns.discount) tableColumn.push("Discount (%)");
    if (selectedColumns.currentPrice) tableColumn.push("Current Price");
    if (selectedColumns.status) tableColumn.push("Status");

    if (tableColumn.length < 2) {
      alert("Please select at least two columns to generate the PDF report.");
      return;
    }

    const tableRows = discounts.map((item) => {
      const row: (string | number)[] = [];
      const originalPrice = item.productId.unitPrice;
      const discountAmount = (originalPrice * item.percentage) / 100;
      const currentPrice = originalPrice - discountAmount;

      if (selectedColumns.productName) row.push(item.productId.name);
      if (selectedColumns.category) row.push(item.productId.category);
      if (selectedColumns.originalPrice) row.push(`Rs. ${originalPrice}`);
      if (selectedColumns.discount) row.push(`${item.percentage}%`);
      if (selectedColumns.currentPrice) row.push(`Rs. ${currentPrice.toFixed(2)}`);
      if (selectedColumns.status) row.push(item.status ? "Available" : "Not Available");

      return row;
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [253, 170, 28] },
      startY: 20,
    });

    doc.setFontSize(18);
    doc.text("Discounts Report", 14, 15);
    doc.save("discounts-report.pdf");
  };

  // Fetch products
  useEffect(() => {
    const getRecycleProducts = async (): Promise<void> => {
      try {
        const response = await axios.get<Product[]>(`${BASE_URL}/products/read`);
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    getRecycleProducts();
  }, []);

  // Fetch discounts
  useEffect(() => {
    const fetchDiscounts = async (): Promise<void> => {
      try {
        const response = await axios.get<Discount[]>(`${BASE_URL}/api/discount/`);
        setDiscounts(response.data);
      } catch (error) {
        console.error("Error fetching discounts", error);
      }
    };
    fetchDiscounts();
  }, []);

  // Submit discount
  const handleSubmit = async (): Promise<void> => {
    try {
      const existingDiscount = discounts.find(
        (discount) => discount.productId._id === selectedProductId && discount.status === true
      );

      if (existingDiscount) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "This product already has an active discount.",
        });
        return;
      }

      if (!selectedProductId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Product isn't selected.",
        });
        return;
      }

      if (discountPercentage <= 0 || discountPercentage >= 100) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Discount percentage should be between 1 to 99.",
        });
        return;
      }

      const response = await axios.post(`${BASE_URL}/api/discount/create`, {
        productId: selectedProductId,
        percentage: discountPercentage,
        status,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Discount added successfully!",
      });

      setDiscounts((prev) => [
        ...prev,
        {
          _id: response.data._id,
          productId: products.find((p) => p._id === selectedProductId)!,
          percentage: discountPercentage,
          status,
        },
      ]);

      // Reset form
      setDiscountPercentage(0);
      setSelectedProductId('');
      setStatus(true);
    } catch (err) {
      console.error("Error submitting:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }
  };

  // Delete discount
  const handleDelete = async (id: string): Promise<void> => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this discount?");
      if (!confirmDelete) return;

      await axios.delete(`${BASE_URL}/api/discount/delete/${id}`);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Discount deleted successfully!",
      });

      setDiscounts(discounts.filter((discount) => discount._id !== id));
    } catch (error) {
      console.error("Error deleting discount:", error);
      alert("Failed to delete the discount.");
    }
  };

  // Edit discount
  const handleEdit = (discount: Discount): void => {
    setDiscountPercentage(discount.percentage);
    setStatus(discount.status);
    setEditId(discount._id);
    setShowEditModal(true);
  };

  // Update discount
  const handleUpdate = async (): Promise<void> => {
    if (!editId) return;

    try {
      await axios.put(`${BASE_URL}/api/discount/update/${editId}`, {
        percentage: discountPercentage,
        status,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Discount updated successfully!",
      });

      setDiscounts((prev) =>
        prev.map((item) =>
          item._id === editId ? { ...item, percentage: discountPercentage, status } : item
        )
      );

      setShowEditModal(false);
      setEditId(null);
      setDiscountPercentage(0);
      setStatus(true);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update discount");
    }
  };

  // Calculate stats
  const calculateStats = () => {
    const activeDiscounts = discounts.filter(d => d.status).length;
    const totalSavings = discounts.reduce((sum, discount) => {
      if (discount.status) {
        const saving = (discount.productId.unitPrice * discount.percentage) / 100;
        return sum + saving;
      }
      return sum;
    }, 0);
    const avgDiscount = discounts.length > 0 
      ? discounts.reduce((sum, d) => sum + d.percentage, 0) / discounts.length 
      : 0;

    return { activeDiscounts, totalSavings, avgDiscount };
  };

  const stats = calculateStats();
  
  // Filter discounts based on search
  const filteredDiscounts = discounts.filter(discount =>
    discount.productId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.productId.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
              <p className="text-gray-600 mt-2">Create and manage product discounts and promotions</p>
            </div>
            <button 
              onClick={() => setShowReportModal(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-lg"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Discounts</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeDiscounts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TagIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-3xl font-bold text-blue-600">Rs. {stats.totalSavings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Discount</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.avgDiscount.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Discounts</p>
                <p className="text-3xl font-bold text-purple-600">{discounts.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Discount Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <PlusIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Add New Discount</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                  <Select
                    options={products.map((product) => ({ value: product._id, label: `${product.name} - Rs. ${product.unitPrice}` }))}
                    onChange={(selectedOption: SingleValue<SelectOption>) =>
                      setSelectedProductId(selectedOption ? selectedOption.value : "")
                    }
                    value={
                      products
                        .map((product) => ({ value: product._id, label: `${product.name} - Rs. ${product.unitPrice}` }))
                        .find((option) => option.value === selectedProductId) || null
                    }
                    placeholder="Select a product..."
                    isClearable
                    className="w-full"
                    classNamePrefix="react-select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage: {discountPercentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="99"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0%</span>
                    <span>99%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span className="text-sm text-gray-600">
                      {status ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <button
                    onClick={() => setStatus(!status)}
                    className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      status ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                        status ? 'translate-x-7' : ''
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Add Discount
                </button>
              </div>
            </div>
          </div>

          {/* Discounts List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Available Discounts</h2>
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search discounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDiscounts.map((item) => {
                      const originalPrice = item.productId.unitPrice;
                      const discountAmount = (originalPrice * item.percentage) / 100;
                      const currentPrice = originalPrice - discountAmount;
                      
                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{item.productId.name}</div>
                              <div className="text-sm text-gray-500">{item.productId.category}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">Rs. {originalPrice}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              -{item.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-green-600">Rs. {currentPrice.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status ? 'Available' : 'Not Available'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredDiscounts.length === 0 && (
                  <div className="text-center py-12">
                    <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No discounts found</p>
                    <p className="text-gray-400">
                      {searchTerm ? 'Try adjusting your search terms' : 'Create your first discount to get started'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Discount</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage: {discountPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span>99%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className="text-sm text-gray-600">
                    {status ? 'Available' : 'Not Available'}
                  </span>
                </div>
                <button
                  onClick={() => setStatus(!status)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    status ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      status ? 'translate-x-7' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Update Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Generate Discounts Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 mb-4">Select the columns you want to include in the report:</p>
              {Object.keys(selectedColumns).map((key) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedColumns[key as keyof SelectedColumns]}
                    onChange={() =>
                      setSelectedColumns(prev => ({
                        ...prev,
                        [key]: !prev[key as keyof SelectedColumns]
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generatePDF();
                  setShowReportModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsPage;