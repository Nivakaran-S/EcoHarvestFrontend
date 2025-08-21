"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import Swal from "sweetalert2";

// Type definitions
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

interface ColumnSelection {
  productName: boolean;
  category: boolean;
  originalPrice: boolean;
  discount: boolean;
  currentPrice: boolean;
  status: boolean;
}

interface SelectOption {
  value: string;
  label: string;
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
  const [selectedColumns, setSelectedColumns] = useState<ColumnSelection>({
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
        const response = await axios.get<Product[]>("http://localhost:8000/products/read");
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
        const response = await axios.get<Discount[]>("http://localhost:8000/api/discount/");
        setDiscounts(response.data);
      } catch (error) {
        console.error("Error fetching discounts", error);
      }
    };
    fetchDiscounts();
  }, []);

  // Submit new discount
  const handleSubmit = async () => {
    try {
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

      const existingDiscount = discounts.find(
        (discount) => discount.productId._id === selectedProductId && discount.status
      );
      if (existingDiscount)
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "This product already has an active discount.",
        });

      const response = await axios.post("http://localhost:8000/api/discount/create", {
        productId: selectedProductId,
        percentage: discountPercentage,
        status: status,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Discount added successfully!",
      });
      setDiscounts([...discounts, response.data]);
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

      await axios.delete(`http://localhost:8000/api/discount/delete/${id}`);
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
      await axios.put(`http://localhost:8000/api/discount/update/${editId}`, {
        percentage: discountPercentage,
        status: status,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Discount Updated successfully!",
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
      {/* ... UI remains same ... */}
    </div>
  );
}
