"use client";

import { useEffect, useState } from "react";

const BASE_URL = "https://eco-harvest-backend.vercel.app";

interface Product {
  productId?: {
    name?: string;
  };
  quantity?: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  products: Product[];
  totalAmount: number;
  status: string;
  orderTime: string;
}

const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const vendorId = localStorage.getItem("vendorId");
        if (!vendorId) {
          console.error("Vendor ID not found");
          return;
        }

        const ordersRes = await fetch(`${BASE_URL}/orders/vendor/${vendorId}`, {
          credentials: "include",
        });
        
        if (!ordersRes.ok) throw new Error("Failed to fetch orders");
        
        const ordersData: Order[] = await ordersRes.json();
        setOrders(ordersData.slice(0, 5));
      } catch (err) {
        console.error("Error fetching vendor orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "pending payment":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Orders</h3>

      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-6 text-gray-500">No recent orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-gray-600">
                      {order.products.map((p, idx) => (
                        <div key={idx}>{p.productId?.name || "Unnamed Product"}</div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-semibold text-gray-900">
                      Rs. {order.totalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-gray-500">
                      {new Date(order.orderTime).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;