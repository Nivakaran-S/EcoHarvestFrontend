"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Card from "./components/Card";
import RecentOrders from "./components/RecentOrders";
import sales from "./images/sales.png";
import saved from "./images/saved.png";
import orders from "./images/orders.png";
import reduced from "./images/reduced.png";

const BASE_URL = "https://eco-harvest-backend.vercel.app";

interface VendorStats {
  totalSales: number;
  totalOrders: number;
  activeProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalProductsSold: number;
  averageRating: number;
}

interface Product {
  _id: string;
  vendorId: string;
  quantity: number;
  status: string;
  averageRating?: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  orderTime: string;
  products: {
    productId: string;
    quantity: number;
  }[];
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [vendorStats, setVendorStats] = useState<VendorStats>({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProductsSold: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const cookieRes = await fetch(`${BASE_URL}/check-cookie`, {
          credentials: "include",
        });
        if (!cookieRes.ok) throw new Error("Not authenticated");

        const cookieData = await cookieRes.json();
        if (cookieData.role !== "Vendor") {
          router.push("/");
          return;
        }

        setIsLoggedIn(true);
        const userId = cookieData.id;

        const vendorRes = await fetch(`${BASE_URL}/vendors/${userId}`, {
          credentials: "include",
        });
        const vendorData = await vendorRes.json();
        
        const vendorEntityId = vendorData[1]?.entityId;
        const vendorInfo = vendorData[0];
        
        setVendorId(vendorEntityId);
        setVendorName(vendorInfo?.businessName || "Vendor");
        
        if (vendorEntityId) {
          localStorage.setItem("vendorId", vendorEntityId);
        }

        try {
          const notifRes = await fetch(`${BASE_URL}/notification/${userId}`);
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            setNotifications(notifData);
          }
        } catch (err) {
          console.error("Error fetching notifications:", err);
        }

        if (vendorEntityId) {
          await fetchVendorStats(vendorEntityId);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const fetchVendorStats = async (vendorEntityId: string) => {
    try {
      const productsRes = await fetch(`${BASE_URL}/products`);
      const allProducts: Product[] = await productsRes.json();
      const vendorProducts = allProducts.filter(p => p.vendorId === vendorEntityId);

      const ordersRes = await fetch(`${BASE_URL}/orders`);
      const allOrders: Order[] = await ordersRes.json();
      
      const vendorOrders = allOrders.filter(order => 
        order.products.some(p => 
          vendorProducts.some(vp => vp._id === p.productId)
        )
      );

      const activeProducts = vendorProducts.filter(p => p.status === "In Stock").length;
      const totalOrders = vendorOrders.length;
      const pendingOrders = vendorOrders.filter(o => 
        o.status === "Pending" || o.status === "Pending Payment"
      ).length;
      const completedOrders = vendorOrders.filter(o => 
        o.status === "Completed" || o.status === "Paid"
      ).length;
      
      const totalRevenue = vendorOrders
        .filter(o => o.status === "Completed" || o.status === "Paid")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      const totalProductsSold = vendorOrders
        .filter(o => o.status === "Completed" || o.status === "Paid")
        .reduce((sum, order) => {
          return sum + order.products
            .filter(p => vendorProducts.some(vp => vp._id === p.productId))
            .reduce((pSum, p) => pSum + (p.quantity || 0), 0);
        }, 0);

      const productsWithRating = vendorProducts.filter(p => p.averageRating && p.averageRating > 0);
      const averageRating = productsWithRating.length > 0 
        ? productsWithRating.reduce((sum, p) => sum + (p.averageRating || 0), 0) / productsWithRating.length
        : 0;

      setVendorStats({
        totalSales: totalProductsSold,
        totalOrders,
        activeProducts,
        totalRevenue,
        pendingOrders,
        completedOrders,
        totalProductsSold,
        averageRating,
      });

    } catch (error) {
      console.error("Error fetching vendor stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="text-black flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 ml-[20vw]">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {vendorName}!</h1>
            <p className="text-gray-600 mt-1">Here's your business overview</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <Card 
              title="Total Revenue" 
              value={`Rs. ${vendorStats.totalRevenue.toLocaleString()}`} 
              percentage="+0%"
              imageSrc={sales} 
            />
            <Card 
              title="Products Sold" 
              value={vendorStats.totalProductsSold.toLocaleString()} 
              percentage="+0%"
              imageSrc={saved} 
            />
            <Card 
              title="Total Orders" 
              value={vendorStats.totalOrders.toString()} 
              percentage="+0%"
              imageSrc={orders} 
            />
            <Card 
              title="Active Products" 
              value={vendorStats.activeProducts.toString()} 
              percentage="+0%"
              imageSrc={reduced} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Orders</h3>
              <p className="text-3xl font-bold text-orange-600">{vendorStats.pendingOrders}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Completed Orders</h3>
              <p className="text-3xl font-bold text-green-600">{vendorStats.completedOrders}</p>
              <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Average Rating</h3>
              <p className="text-3xl font-bold text-blue-600">
                {vendorStats.averageRating > 0 ? vendorStats.averageRating.toFixed(1) : 'N/A'}
                {vendorStats.averageRating > 0 && <span className="text-sm text-gray-500">/5</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1">Customer satisfaction</p>
            </div>
          </div>

          <div className="mt-8">
            <RecentOrders />
          </div>

          {notifications.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Recent Notifications</h2>
              <div className="bg-white rounded-lg shadow-md p-4 max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification._id} className="border-b border-gray-200 last:border-b-0 py-3">
                    <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}