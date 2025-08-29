"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import RecentOrders from "../components/RecentOrders";

import sales from "../images/sales.png";
import saved from "../images/saved.png";
import orders from "../images/orders.png";
import reduced from "../images/reduced.png";

// ==== Base URL ====
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// ==== Types ====
interface UserInformation {
  _id: string;
  name?: string;
  entityId?: string;
  [key: string]: any;
}

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  [key: string]: any;
}

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
  name: string;
  unitPrice: number;
  quantity: number;
  status: string;
  [key: string]: any;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  products: any[];
  [key: string]: any;
}

export default function Dashboard() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");

  const [userInformation, setUserInformation] = useState<UserInformation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // New state for real dashboard data
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
  
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/check-cookie/`, {
          withCredentials: true,
        });

        const userId = response.data.id;
        const userRole = response.data.role;

        setId(userId);
        setRole(userRole);

        if (userRole !== "Vendor") {
          router.push("/");
          return;
        } else {
          setIsLoggedIn(true);
        }

        // Fetch user information
        try {
          const userInfoResponse = await axios.get(`${BASE_URL}/vendors/${userId}`);
          setUserInformation(userInfoResponse.data);

          // Fetch notifications
          try {
            const notificationsResponse = await axios.get(`${BASE_URL}/notification/${userId}`);
            setNotifications(notificationsResponse.data);
          } catch (err) {
            console.error("Error fetching notifications:", err);
          }
          
          // Fetch vendor-specific data
          await fetchVendorData(userId);
          
        } catch (err) {
          console.error("Error fetching user information:", err);
        }
      } catch (error) {
        console.error("Error fetching cookies:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCookies();
  }, [router]);

  // Fetch vendor-specific dashboard data
  const fetchVendorData = async (vendorId: string) => {
    try {
      // Fetch vendor products
      const productsResponse = await axios.get(`${BASE_URL}/products/vendor/${vendorId}`);
      const products = productsResponse.data;
      setVendorProducts(products);

      // Fetch vendor orders
      const ordersResponse = await axios.get(`${BASE_URL}/orders/vendor/${vendorId}`);
      const orders = ordersResponse.data;
      setVendorOrders(orders);

      // Calculate statistics
      const stats = calculateVendorStats(products, orders);
      setVendorStats(stats);

    } catch (error) {
      console.error("Error fetching vendor data:", error);
    }
  };

  // Calculate real statistics from fetched data
  const calculateVendorStats = (products: Product[], orders: Order[]): VendorStats => {
    const activeProducts = products.filter(p => p.status === "In Stock").length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "Pending").length;
    const completedOrders = orders.filter(o => o.status === "Completed" || o.status === "Delivered").length;
    
    const totalRevenue = orders
      .filter(o => o.status === "Completed" || o.status === "Delivered")
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const totalProductsSold = orders
      .filter(o => o.status === "Completed" || o.status === "Delivered")
      .reduce((sum, order) => {
        return sum + (order.products?.reduce((productSum, product) => productSum + (product.quantity || 0), 0) || 0);
      }, 0);

    // Calculate average rating from products
    const productsWithRating = products.filter(p => p.averageRating && p.averageRating > 0);
    const averageRating = productsWithRating.length > 0 
      ? productsWithRating.reduce((sum, p) => sum + (p.averageRating || 0), 0) / productsWithRating.length
      : 0;

    return {
      totalSales: totalProductsSold,
      totalOrders,
      activeProducts,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalProductsSold,
      averageRating,
    };
  };

  // Calculate percentage changes (you can enhance this with historical data)
  const getPercentageChange = (current: number, previous: number = 0): string => {
    if (previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="text-black flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        <Navbar />
        
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {userInformation[0]?.name || 'Vendor'}!
          </h1>
          <p className="text-gray-600">Here's your business overview</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card 
            title="Total Revenue" 
            value={`Rs. ${vendorStats.totalRevenue.toLocaleString()}`} 
            percentage={getPercentageChange(vendorStats.totalRevenue)}
            imageSrc={sales} 
          />
          <Card 
            title="Products Sold" 
            value={vendorStats.totalProductsSold.toLocaleString()} 
            percentage={getPercentageChange(vendorStats.totalProductsSold)}
            imageSrc={saved} 
          />
          <Card 
            title="Total Orders" 
            value={vendorStats.totalOrders.toString()} 
            percentage={getPercentageChange(vendorStats.totalOrders)}
            imageSrc={orders} 
          />
          <Card 
            title="Active Products" 
            value={vendorStats.activeProducts.toString()} 
            percentage={getPercentageChange(vendorStats.activeProducts)}
            imageSrc={reduced} 
          />
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm">Pending Orders</h3>
            <p className="text-2xl font-bold text-orange-600">{vendorStats.pendingOrders}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm">Completed Orders</h3>
            <p className="text-2xl font-bold text-green-600">{vendorStats.completedOrders}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm">Average Rating</h3>
            <p className="text-2xl font-bold text-blue-600">
              {vendorStats.averageRating > 0 ? vendorStats.averageRating.toFixed(1) : 'N/A'}
              {vendorStats.averageRating > 0 && <span className="text-sm text-gray-500">/5</span>}
            </p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="mt-8">
          <RecentOrders />
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Recent Notifications</h2>
            <div className="bg-white rounded-lg shadow-md p-4">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification._id} className="border-b border-gray-200 last:border-b-0 py-2">
                  <p className="text-gray-800">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}