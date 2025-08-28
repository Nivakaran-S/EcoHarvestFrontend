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

export default function Dashboard() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");

  const [userInformation, setUserInformation] = useState<UserInformation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

        try {
          const userInfoResponse = await axios.get(`${BASE_URL}/vendors/${userId}`);
          setUserInformation(userInfoResponse.data);

          try {
            const notificationsResponse = await axios.get(`${BASE_URL}/notification/${userId}`);
            setNotifications(notificationsResponse.data);
          } catch (err) {
            console.error("Error fetching notifications:", err);
          }
        } catch (err) {
          console.error("Error fetching user information:", err);
        }
      } catch (error) {
        console.error("Error fetching cookies:", error);
        router.push("/login");
      }
    };

    fetchCookies();
  }, [router]);

  return (
    <div className="text-black flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        <Navbar />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card title="Total Sales" value="$12,458" percentage="+12.5%" imageSrc={sales} />
          <Card title="Food Saved" value="2,345 kg" percentage="+8.1%" imageSrc={saved} />
          <Card title="Active Orders" value="48" percentage="+2.4%" imageSrc={orders} />
          <Card title="CO2 Reduced" value="1,234 kg" percentage="+15.2%" imageSrc={reduced} />
        </div>
        <div className="mt-6">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
