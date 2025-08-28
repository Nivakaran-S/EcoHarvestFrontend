"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// ====== Base URL ======
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// Vendor type
interface Vendor {
  _id: string;
  businessName?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

// Notification type
interface Notification {
  _id: string;
  message: string;
  read: boolean;
  [key: string]: any;
}

// Cookie response type
interface CookieResponse {
  id: string;
  role: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userInformation, setUserInformation] = useState<Vendor[]>([]);
  const [role, setRole] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get<CookieResponse>(
          `${BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        const userId = response.data.id;

        try {
          const response2 = await axios.get<Vendor[]>(
            `${BASE_URL}/vendors/${userId}`
          );
          setUserInformation(response2.data);

          try {
            const response3 = await axios.get<Notification[]>(
              `${BASE_URL}/notification/${userId}`
            );
            setNotifications(response3.data);
          } catch (err) {
            console.error("Error fetching notifications:", err);
          }
        } catch (err) {
          console.error("Error fetching user information:", err);
        }

        setId(userId);
        setRole(response.data.role);

        if (response.data.role === "Vendor") {
          setIsLoggedIn(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching cookies:", error);
        router.push("/login");
      }
    };

    fetchCookies();
  }, [router]);

  useEffect(() => {
    router.replace("/vendor/dashboard");
  }, [router]);

  return <div>Redirecting to Dashboard...</div>;
}
