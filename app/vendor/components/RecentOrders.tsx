"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// ==== Base URL ====
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// ==== Types ====
interface Product {
  productId?: {
    name?: string;
  };
  quantity?: number;
  price?: number;
}

interface Order {
  _id: string;
  products: Product[];
  totalAmount: number;
  status: "Completed" | "Processing" | "Pending" | string;
  orderTime: string; // ISO date string
}

const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);

  // Fetch vendor ID
  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const res = await fetch(`${BASE_URL}/check-cookie`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || data.role !== "Vendor") {
          throw new Error("Not a vendor or unauthorized");
        }

        const userId = data.id;
        const userRes = await fetch(`${BASE_URL}/vendors/${userId}`, {
          credentials: "include",
        });
        const userData = await userRes.json();

        if (!userRes.ok || !userData[1]?.entityId) {
          throw new Error("User entityId (vendorId) not found");
        }

        setVendorId(userData[1].entityId);
      } catch (err) {
        console.error("Error fetching vendor ID:", err);
      }
    };

    fetchVendorId();
  }, []);

  // Fetch vendor orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!vendorId) return;

      try {
        const ordersRes = await axios.get<Order[]>(
          `${BASE_URL}/orders/vendor/${vendorId}`,
          { withCredentials: true }
        );
        setOrders(ordersRes.data);
      } catch (err) {
        console.error("Error fetching vendor orders:", err);
      }
    };

    fetchOrders();
  }, [vendorId]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-3">Recent Orders</h3>

      {orders.length === 0 ? (
        <p>No recent orders found.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Order ID</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id} className="border-b">
                <td className="p-2">{(index + 1).toString().padStart(3, "0")}</td>
                <td>
                  {order.products.map((p, idx) => (
                    <div key={idx}>{p.productId?.name || "Unnamed Product"}</div>
                  ))}
                </td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      order.status === "Completed"
                        ? "bg-green-200 text-green-800"
                        : order.status === "Processing"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.orderTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecentOrders;
