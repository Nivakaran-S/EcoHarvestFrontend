'use client';
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ===== Base URL =====
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// Define types for orders
interface ProductItem {
  productId: {
    name: string;
  };
  quantity: number;
  unitPrice: number;
}

interface Order {
  orderNumber: string;
  orderTime: string | Date;
  status: string;
  totalAmount: number;
  products: ProductItem[];
  userId: string;
}

interface SelectedColumns {
  orderNumber: boolean;
  date: boolean;
  status: boolean;
  total: boolean;
  products: boolean;
  user: boolean;
}

const OrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportTitle, setReportTitle] = useState<string>("Order Summary Report");
  const [reportNotes, setReportNotes] = useState<string>("");
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>({
    orderNumber: true,
    date: true,
    status: true,
    total: true,
    products: true,
    user: false,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let url = `${BASE_URL}/orders/`;
        if (startDate && endDate) {
          url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        }
        const response = await axios.get<Order[]>(url);
        setOrders(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [startDate, endDate]);

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add report title
    doc.setFontSize(18);
    doc.text(reportTitle, 15, 15);

    let currentY = 25;

    if (startDate && endDate) {
      doc.setFontSize(12);
      doc.text(
        `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        15,
        currentY
      );
      currentY += 10;
    }

    if (reportNotes) {
      doc.setFontSize(10);
      doc.text(`Notes: ${reportNotes}`, 15, currentY, { maxWidth: 180 });
      currentY += doc.splitTextToSize(reportNotes, 180).length * 5 + 5;
    }

    const headers: string[] = [];
    const columnKeys: (keyof Order | "products")[] = [];

    if (selectedColumns.orderNumber) {
      headers.push("Order #");
      columnKeys.push("orderNumber");
    }
    if (selectedColumns.date) {
      headers.push("Date");
      columnKeys.push("orderTime");
    }
    if (selectedColumns.status) {
      headers.push("Status");
      columnKeys.push("status");
    }
    if (selectedColumns.total) {
      headers.push("Total");
      columnKeys.push("totalAmount");
    }
    if (selectedColumns.products) {
      headers.push("Products");
      columnKeys.push("products");
    }
    if (selectedColumns.user) {
      headers.push("User");
      columnKeys.push("userId");
    }

    const filteredOrders = orders.filter((order) => {
      if (!startDate || !endDate) return true;
      const orderDate = new Date(order.orderTime);
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(23, 59, 59, 999));
      return orderDate >= start && orderDate <= end;
    });

    const body = filteredOrders.map((order) => {
      const row: (string | number)[] = [];
      if (selectedColumns.orderNumber) row.push(order.orderNumber);
      if (selectedColumns.date) row.push(new Date(order.orderTime).toLocaleDateString());
      if (selectedColumns.status) row.push(order.status);
      if (selectedColumns.total) row.push(`Rs. ${order.totalAmount.toFixed(2)}`);
      if (selectedColumns.products)
        row.push(
          order.products
            .map(
              (p) => `${p.quantity} x ${p.productId.name} @ Rs. ${p.unitPrice.toFixed(2)}`
            )
            .join("\n")
        );
      if (selectedColumns.user) row.push(order.userId);
      return row;
    });

    autoTable(doc, {
      head: [headers],
      body,
      startY: currentY,
      styles: { cellPadding: 1, fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      columnStyles: { [headers.indexOf("Products")]: { cellWidth: 60 } },
    });

    doc.save(`${reportTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    setShowModal(false);
  };

  const handleColumnToggle = (column: keyof SelectedColumns) => {
    setSelectedColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div>
      {/* Orders Table and Modal */}
      <div className="bg-gray-100 flex text-black space-x-2 flex-row min-h-[90vh] py-[8px] w-full">
        <div className="rounded-[10px] pb-[50px] pt-[5px] w-[100%]">
          <div>
            <div className="flex flex-row bg-gray-300 w-[83%] px-[20px] py-[10px] fixed top-[10vh] justify-between items-center">
              <p className="text-[25px]">Orders Summary</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#FDAA1C] cursor-pointer ring-yellow-800 ring-[0.5px] py-[5px] px-[20px] rounded-[5px] text-[15px]"
              >
                Export Report
              </button>
            </div>
            <div className="pt-[50px] px-[25px] pb-[20px]">
              <div className="flex flex-row items-center justify-between bg-[#F5F5F5] rounded-[10px] px-[10px] py-[10px] text-[15px]">
                <div className="flex flex-row items-center justify-center w-[20%]"><p>Order Number</p></div>
                <div className="flex flex-row items-center justify-center w-[20%]"><p>Date</p></div>
                <div className="flex flex-row items-center justify-center w-[20%]"><p>Products</p></div>
                <div className="flex flex-row items-center justify-center w-[20%]"><p>Status</p></div>
                <div className="flex flex-row items-center justify-center w-[20%]"><p>Total Amount</p></div>
                <div className="flex flex-row items-center justify-center w-[20%]"><p>User</p></div>
              </div>

              {orders.map((order, index) => (
                <div
                  key={index}
                  className="flex bg-gray-200 pl-[30px] mb-[3px] flex-row items-center justify-between bg-[#F5F5F5] rounded-[10px] px-[10px] py-[10px] text-[15px]"
                >
                  <div className="flex flex-row items-center justify-center w-[20%]"><p className="text-[13px]">{order.orderNumber}</p></div>
                  <div className="flex flex-col items-center justify-center w-[20%]">
                    <p className="text-[13px]">{new Date(order.orderTime).toLocaleDateString()}</p>
                    <p className="text-[13px]">{new Date(order.orderTime).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex flex-row items-center justify-center w-[20%]">
                    <p className="text-[13px]">
                      {order.products.map(p => `${p.productId.name} x ${p.quantity} @ Rs.${p.unitPrice.toFixed(2)}`).join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-center w-[20%]"><p className="text-[13px]">{order.status}</p></div>
                  <div className="flex flex-row items-center justify-center w-[20%]"><p className="text-[13px]">Rs. {order.totalAmount}</p></div>
                  <div className="flex flex-row items-center justify-center w-[20%]"><p className="text-[13px]">{order.userId}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0  flex items-center justify-center">
          <div onClick={() => setShowModal(false)} className="bg-black h-[100vh] w-[100vw] opacity-50">

          </div>
          <div className="bg-white absolute text-black p-[20px] rounded-[10px] w-[500px]">
            <h2 className="text-[20px] mb-[15px]">Customize Report</h2>
            <div className="mb-[15px]">
              <label className="block text-[15px] mb-[5px]">Report Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full border outline-none rounded-[5px] px-[10px] py-[5px]"
              />
            </div>
            <div className="mb-[15px]">
              <label className="block text-[15px] mb-[5px]">Date Range</label>
              <div className="flex space-x-[10px]">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  className="border outline-none cursor-pointer rounded-[5px] px-[10px] py-[5px] w-full"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  placeholderText="End Date"
                  className="border outline-none cursor-pointer rounded-[5px] px-[10px] py-[5px] w-full"
                />
              </div>
            </div>
            <div className="mb-[15px]">
              <label className="block text-[15px] mb-[5px]">Select Columns</label>
              <div className="grid grid-cols-2 gap-[10px]">
                {(Object.keys(selectedColumns) as (keyof SelectedColumns)[]).map((column) => (
                  <label key={column} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedColumns[column]}
                      onChange={() => handleColumnToggle(column)}
                      className="mr-[5px]"
                    />
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, " $1")}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-[15px]">
              <label className="block text-[15px] mb-[5px]">Notes</label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                className="w-full outline-none border rounded-[5px] px-[10px] py-[5px]"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-[10px]">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 py-[5px] px-[20px] rounded-[5px] text-[15px]"
              >
                Cancel
              </button>
              <button
                onClick={generatePDF}
                className="bg-[#FDAA1C] py-[5px] px-[20px] rounded-[5px] text-[15px]"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersDashboard;
