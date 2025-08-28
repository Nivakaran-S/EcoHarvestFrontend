"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FiFilter } from "react-icons/fi";
import axios from "axios";

// ===== Base URL =====
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// Interfaces for TypeScript
interface User {
  _id: string;
  name: string;
}

interface OrderProduct {
  productId?: {
    _id: string;
    name: string;
  };
  quantity: number;
}

interface Order {
  _id: string;
  userId?: User;
  orderTime: string;
  status: "Completed" | "Pending" | "Cancelled" | string;
  totalAmount: number;
  products: OrderProduct[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVendorOrders = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/check-cookie/`, {
          withCredentials: true,
        });

        const { id, role } = res.data;
        if (role !== "Vendor") return;

        const vid = localStorage.getItem("vendorId");
        if (!vid) throw new Error("Vendor ID not found in localStorage");

        const ordersRes = await axios.get<Order[]>(`${BASE_URL}/orders/vendor/${vid}`, {
          withCredentials: true,
        });

        setOrders(ordersRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load vendor orders:", err);
        setLoading(false);
      }
    };

    fetchVendorOrders();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-semibold">Orders</h2>
          <p className="text-gray-600">Manage and track all your orders</p>

          <div className="flex items-center gap-3 mt-4">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full p-2 border rounded-md"
            />
            <button className="flex items-center px-3 py-2 bg-white border rounded-md shadow min-w-[150px]">
              Date Range
            </button>
            <button className="flex items-center px-3 py-2 bg-white border rounded-md shadow min-w-[150px]">
              All Status
            </button>
            <button className="flex items-center px-3 py-2 bg-white border rounded-md shadow min-w-[150px]">
              All Categories
            </button>
            <button className="p-2 bg-gray-200 rounded-md">
              <FiFilter />
            </button>
          </div>

          <div className="mt-4 bg-white shadow rounded-lg p-4">
            {loading ? (
              <p>Loading orders...</p>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4">Order Number</th>
                      <th className="py-2 px-4">Customer</th>
                      <th className="py-2 px-4">Date</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order._id} className="border-b">
                        <td className="py-2 px-4">
                          {(index + 1).toString().padStart(3, "0")}
                        </td>
                        <td className="py-2 px-4">{order.userId?.name || "N/A"}</td>
                        <td className="py-2 px-4">
                          {new Date(order.orderTime).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              order.status === "Completed"
                                ? "bg-green-100 text-green-600"
                                : order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2 px-4">${order.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No orders found</p>
                )}
              </>
            )}
          </div>

          {!loading && orders.length > 0 && (
            <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
              <p>
                Showing 1 to {orders.length} of {orders.length} entries
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border rounded-md">Previous</button>
                <button className="px-3 py-1 bg-yellow-500 text-white rounded-md">1</button>
                <button className="px-3 py-1 border rounded-md">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
