"use client";
import React from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Base URL for API requests
const BASE_URL = "https://eco-harvest-backend.vercel.app";

const ProfilePage = () => {
  const [id, setId] = useState("");
  const [role, setRole] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cart, setCart] = useState<{ products: any[] }>({ products: [] });
  const router = useRouter();

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/check-cookie/`,
          {
            withCredentials: true,
          }
        );

        console.log(response.data);
        setId(response.data.id);
        setRole(response.data.role);

        if (response.data.role === "Customer") {
          setUserLoggedIn(true);
          try {
            const response2 = await axios.get(
              `${BASE_URL}/cart/${response.data.id}`
            );
            setCart({ products: response2.data });
            console.log("Cart items fetched successfully:", response2.data);
          } catch (err) {
            console.error("Error fetching cart items:", err);
          }
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error fetching cookies:", error);
      }
    };

    fetchCookies();
  }, []);

  return (
    <div>
      <Navigation
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
        productsDetail={cart.products}
        numberOfCartItems={cart.products.length}
      />
      <div className="pt-[15vh] w-[100%] flex items-center justify-center text-black">
        <div className="w-[95%] h-[100vh] ">
          <p>This is the profile</p>
        </div>
      </div>
      <Max />
      <Footer />
    </div>
  );
};

export default ProfilePage;