"use client";

import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://eco-harvest-backend.vercel.app";

// Interfaces
interface Cart {
  products: any[];
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  subtitle: string;
  // Add other relevant fields
}

const Payment: React.FC = () => {
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [cart, setCart] = useState<Cart>({ products: [] });
  const [productsDetail, setProductsDetail] = useState<Product[]>([]);
  const [id, setId] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const fetchCart = async (): Promise<void> => {
      if (!userLoggedIn) {
        return;
      }
      try {
        console.log("Fetching cart for user id:", id);
        const response = await axios.get<{
          cart: Cart;
          products: Product[];
        }>(`${API_BASE_URL}/cart/${id}`); // <-- use base URL

        setCart(response.data.cart);

        // Map products to ProductDetail objects with defaults
        setProductsDetail(
          response.data.products.map((product: any) => ({
            ...product,
            imageUrl: product.imageUrl ?? "",
            subtitle: product.subtitle ?? "",
          }))
        );

        console.log("Product items fetched successfully:", response.data.products);
        console.log("Cart items fetched successfully:", response.data.cart);

        setNumberOfCartItems(response.data.cart.products.length);
        console.log("Number of cart items:", response.data.cart.products.length);
      } catch (err) {
        console.log("Cart Empty", err);
      }
    };

    fetchCart();
  }, [id, userLoggedIn]);

  return (
    <div>
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        userLoggedIn={userLoggedIn}
      />
      <div className="h-[100vh] w-[100%]"></div>
      <Footer />
    </div>
  );
};

export default Payment;
