"use client";
import Image from "next/image";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import AllCategories from "./components/AllCategories";
import Footer from "./components/Footer";
import Max from "./components/Max";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


const BASE_URL = "https://eco-harvest-backend.vercel.app"; 

export default function CustomerHome() {
  const [id, setId] = useState("");
  const [role, setRole] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cart, setCart] = useState<{ products: any[] }>({ products: [] });
  const [productsDetail, setProductsDetail] = useState([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInformation, setUserInformation] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/check-cookie/`, {
          withCredentials: true,
        });

        const userId = response.data.id;

        try {
          const response2 = await axios.get(`${BASE_URL}/customers/details/:${userId}`);
          setUserInformation(response2.data);

          try {
            const response3 = await axios.get(`${BASE_URL}/notification/:${userId}`);
            setNotifications(response3.data);
          } catch (err) {
            console.error("Error fetching notifications:", err);
          }
        } catch (err) {
          console.error("Error fetching user information:", err);
        }

        setId(userId);
        setRole(response.data.role);
        setIsLoggedIn(true);
        setUserLoggedIn(true);

        if (response.data.role === "Customer") setIsLoggedIn(true);

      } catch (error) {
        setIsLoggedIn(false);
        console.error("Error fetching cookies:", error);
      }
    };

    fetchCookies();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (!userLoggedIn) return;

      try {
        const response2 = await axios.get(`${BASE_URL}/cart/${id}`);
        setCart(response2.data.cart);
        setProductsDetail(response2.data.products);
        setNumberOfCartItems(response2.data.cart.products.length);
      } catch (err) {
        console.log("Cart empty or error fetching cart");
      }
    };

    fetchCart();
  }, [id, userLoggedIn]);

  return (
    <div>
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        id={id}
        cart={cart}
        userLoggedIn={userLoggedIn}
      />
      <Hero />
      <AllCategories />
      <Max />
      <Footer />
    </div>
  );
}
