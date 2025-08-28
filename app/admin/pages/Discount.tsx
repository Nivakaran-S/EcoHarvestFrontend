"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Select, { SingleValue } from "react-select";
import Swal from "sweetalert2";

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

export default function Discount() {
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>({
    productName: true,
    category: true,
    originalPrice: true,
    discount: true,
    currentPrice: true,
    status: true,
  });

  // PDF generation
  const generatePDF = () => {
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
      if (selectedColumns.originalPrice) row.push(`$${originalPrice}`);
      if (selectedColumns.discount) row.push(`${item.percentage}%`);
      if (selectedColumns.currentPrice) row.push(`$${currentPrice.toFixed(2)}`);
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
    const getRecycleProducts = async () => {
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
    const fetchDiscounts = async () => {
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
  const handleSubmit = async () => {
    try {
      const existingDiscount = discounts.find(
        (discount) => discount.productId._id === selectedProductId && discount.status === true
      );

      if (existingDiscount)
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "This product already has an active discount.",
        });

      if (!selectedProductId)
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "Product isn't selected.",
        });

      if (discountPercentage <= 0 || discountPercentage >= 100)
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "Discount percentage should be between 1 to 99.",
        });

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
  const handleDelete = async (id: string) => {
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
  const handleEdit = (discount: Discount) => {
    setDiscountPercentage(discount.percentage);
    setStatus(discount.status);
    setEditId(discount._id);
    setShowEditModal(true);
  };

  // Update discount
  const handleUpdate = async () => {
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

  return (
    <div className="min-h-screen w-full overflow-auto p-4">
      {/* Add Discount Section */}
      <div>
        <p className="text-[50px] text-center mb-8">Add Discount</p>

        <div className="flex flex-col mb-[15px] space-y-[5px]">
          <p className="text-[20px] mb-8">
            Available Product
            <Select
              options={products.map((product) => ({ value: product._id, label: product.name }))}
              onChange={(selectedOption: SingleValue<SelectOption>) =>
                setSelectedProductId(selectedOption ? selectedOption.value : "")
              }
              value={
                products
                  .map((product) => ({ value: product._id, label: product.name }))
                  .find((option) => option.value === selectedProductId) || null
              }
              placeholder="Select a product..."
              isClearable
              className="w-full"
            />
          </p>
        </div>

        <div className="flex flex-col space-y-[2px]">
          <div className="mb-8 ">
            <p className="text-[20px]">Discount percentage: {discountPercentage}%</p>
            <input
              type="range"
              min={0}
              max={100}
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="w-[98%] accent-[#FDAA1C] h-[5px] focus:outline-none cursor-pointer"
            />
            <div className="flex flex-row justify-between w-[98%] text-[15px]">
              <p>Min: 0%</p>
              <p>Max: 100%</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-10">
            <p className="text-[20px]">Status: {status ? "Available" : "Not Available"}</p>
            <div
              onClick={() => setStatus(!status)}
              className={`w-14 h-7 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
                status ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                  status ? "translate-x-7" : ""
                }`}
              />
            </div>
          </div>

          <div className="flex px-[20px] pb-[10px] mb-8 mt-10 text-[20px]">
            <div
              className="bg-blue-500 cursor-pointer w-fit px-[15px] py-[5px] rounded mb-8 mt-10 text-center mx-auto text-white"
              onClick={handleSubmit}
            >
              Submit
            </div>
          </div>
        </div>
      </div>

      {/* Available Discounts Table */}
      <div>
        <p className="text-[30px] text-center mb-8">Available discounts</p>
        <div className="flex px-[20px] pb-[10px] mb-8 mt-10 text-[20px]">
          <p
            onClick={() => setShowReportModal(true)}
            className="bg-gray-500 cursor-pointer w-fit px-[15px] py-[5px] rounded mb-8 mt-10 text-right ml-auto text-white"
          >
            Generate Report
          </p>
        </div>

        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2">Product Name</th>
              <th className="border px-4 py-2">Category</th>
              <th className="border px-4 py-2">Original Price</th>
              <th className="border px-4 py-2">Discount (%)</th>
              <th className="border px-4 py-2">Current Price</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((item) => {
              const originalPrice = item.productId.unitPrice;
              const discountAmount = (originalPrice * item.percentage) / 100;
              const currentPrice = originalPrice - discountAmount;

              return (
                <tr key={item._id}>
                  <td className="border px-4 py-2">{item.productId.name}</td>
                  <td className="border px-4 py-2">{item.productId.category}</td>
                  <td className="border px-4 py-2">${originalPrice}</td>
                  <td className="border px-4 py-2">{item.percentage}%</td>
                  <td className="border px-4 py-2">${currentPrice.toFixed(2)}</td>
                  <td className="border px-4 py-2">{item.status ? "Available" : "Not Available"}</td>
                  <td className="border px-4 py-2">
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-500 text-white w-24 px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 text-white w-24 px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] md:w-[400px] shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Discount</h2>

            <p className="mb-2 text-sm">Discount: {discountPercentage}%</p>
            <input
              type="range"
              min={0}
              max={100}
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="w-full accent-[#FDAA1C] mb-4"
            />

            <div className="flex items-center justify-between mb-4">
              <p>Status: {status ? "Available" : "Not Available"}</p>
              <div
                onClick={() => setStatus(!status)}
                className={`w-14 h-7 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
                  status ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                    status ? "translate-x-7" : ""
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] md:w-[400px] shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">Generate Discounts Report</h2>
            <p className="mb-6 text-center">
              Select the columns you want to include in the report:
            </p>

            <div className="space-y-3 mb-6">
              {Object.keys(selectedColumns).map((key) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedColumns[key as keyof SelectedColumns]}
                    onChange={() =>
                      setSelectedColumns({
                        ...selectedColumns,
                        [key]: !selectedColumns[key as keyof SelectedColumns],
                      })
                    }
                    className="mr-2"
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setShowReportModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generatePDF();
                  setShowReportModal(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
