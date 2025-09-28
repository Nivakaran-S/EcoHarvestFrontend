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
  const fetchCookiesAndData = async () => {
    try {
      
      const { data } = await axios.get(`${BASE_URL}/check-cookie`, {
        withCredentials: true,
      });

      const userId = data.id;
      setId(userId);
      setRole(data.role);
      setUserLoggedIn(true);
      setIsLoggedIn(data.role === "Customer");


      const [userRes, notifRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/customers/details/${userId}`),
        axios.get(`${BASE_URL}/notification/${userId}`),
      ]);

      if (userRes.status === "fulfilled") {
        setUserInformation(userRes.value.data);
      } else {
        console.error("Error fetching user information:", userRes.reason);
      }

      if (notifRes.status === "fulfilled") {
        setNotifications(notifRes.value.data);
      } else {
        console.error("Error fetching notifications:", notifRes.reason);
      }

    } catch (error) {
      console.error("Error fetching cookies:", error);
      setIsLoggedIn(false);
      setUserLoggedIn(false);
    }
  };

  fetchCookiesAndData();
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
    <div className="text-black overflow-x-hidden">
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
