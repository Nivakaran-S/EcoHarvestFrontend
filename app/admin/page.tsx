"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { io, Socket } from "socket.io-client";

import Navigation from "./components/Navigation";
import TopNavigation from "./components/TopNavigation";

import OrdersDashboard from "./pages/OrdersDashboard";
import Advertisements from "./pages/Advertisements";
import Inventory from "./pages/Inventory";
import Discount from "./pages/Discount";
import Payment from "./pages/Payment";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import ProfileManagement from "./pages/ProfileManagement";
import { Notification } from "./components/types";

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

interface UserInformation {
  id: string;
  username: string;
  role: string;
  userDetails: UserDetails;
}

export default function AdminDashboard() {
  const [navClick, setNavClick] = useState<string>("Inventory");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userInformation, setUserInformation] = useState<UserInformation | null>(null);
  const [role, setRole] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const router = useRouter();

  // Initialize socket after id and role are available
  useEffect(() => {
    if (id && role) {
      const newSocket = io("http://localhost:8000", {
        query: { id, role },
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to socket server with id:", id, "and role:", role);
        newSocket.emit("ready");
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [id, role]);

  // Fetch user info and notifications
  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get<{ id: string; role: string }>(
          "http://localhost:8000/check-cookie/",
          { withCredentials: true }
        );

        const userId = response.data.id;
        const userRole = response.data.role;

        setId(userId);
        setRole(userRole);

        if (userRole !== "Admin") {
          router.push("/");
          return;
        } else {
          setIsLoggedIn(true);
        }

        // Fetch admin user info
        try {
          const response2 = await axios.get<UserInformation>(
            `http://localhost:8000/admin/:${userId}`
          );
          setUserInformation(response2.data);
        } catch (err) {
          console.error("Error fetching user information:", err);
        }

        // Fetch notifications
        try {
          const response3 = await axios.get<Notification[]>(
            `http://localhost:8000/notification/:${userId}`
          );
          setNotifications(response3.data);
        } catch (err) {
          console.error("Error fetching notifications:", err);
        }
      } catch (error) {
        console.error("Error fetching cookies:", error);
        router.push("/login");
      }
    };

    fetchCookies();
  }, [router]);

  if (!isLoggedIn) return null;

  // Navigation click handler: receives the item string
  const handleNavClick = (item: string) => setNavClick(item);

  // Render pages based on navigation
  const renderPage = () => {
    switch (navClick) {
      case "Inventory":
        return <Inventory />;
      case "Discount":
        return <Discount />;
      case "Payment":
        return <Payment />;
      case "Reports":
        return <Reports />;
      case "User Management":
        return <UserManagement />;
      case "Advertisements":
        return <Advertisements />;
      case "Order Management":
        return <OrdersDashboard />;
      case "Profile Management":
        return (
          <ProfileManagement
            id={id}
            notifications={notifications}
            userInformation={userInformation}
          />
        );
      default:
        return <div className="p-6">Welcome Admin</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <Navigation navClick={navClick} handleNavClick={handleNavClick} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          userInformation={userInformation?.userDetails ?? null}
          id={id}
          isLoggedIn={isLoggedIn}
          notifications={notifications}
        />
        <div className="flex-1 overflow-y-auto">{renderPage()}</div>
      </div>
    </div>
  );
}
