"use client";

import React, { useState, useEffect, ChangeEvent, Suspense } from "react";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import Max from "../components/Max";
import StarRating from "../components/StarRating";

import Image from "next/image";
import ProductImage2 from "../images/product.png";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

// ====== Base URL ======
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// ====== Types ======
interface ProductDetail {
  id: string;
  name: string;
  subtitle: string;
  unitPrice: number;
  MRP: number;
  averageRating: number;
  numberOfReviews: number;
  statSubus?: string;
  imageUrl: string;
}

interface Review {
  userName: string;
  rating: number;
  comment: string;
}

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  name?: string;
  subtitle?: string;
  unitPrice?: number;
  MRP?: number;
  averageRating?: number;
  numberOfReviews?: number;
  statSubus?: string;
  imageUrl?: string;
}

interface Cart {
  products: CartItem[];
}

const ProductPageComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = searchParams.get("productId") || "";
  const discountPriceParam = searchParams.get("discountPrice");
  const discountPercentage = searchParams.get("discountPercentage");
  const discountPrice = discountPriceParam ? Number(discountPriceParam) : null;

  // ====== State ======
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<Cart>({ products: [] });
  const [productDetails, setProductDetails] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<string>("");
  const [userRating, setUserRating] = useState<number>(0);
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // ====== Fetch Product Details ======
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/products/${productId}`);
        const data = response.data;

        setProductDetails({
          id: data.id || data._id || productId,
          name: data.name || data.title || "Unnamed product",
          subtitle: data.subtitle || data.description || "No subtitle available",
          unitPrice: data.unitPrice || data.price || 0,
          MRP: data.MRP || data.mrp || data.unitPrice || 0,
          averageRating: data.averageRating || 0,
          numberOfReviews: data.numberOfReviews || 0,
          statSubus: data.statSubus || "In stock",
          imageUrl: data.imageUrl || ProductImage2.src,
        });
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
      }
    };
    if (productId) fetchProductDetails();
  }, [productId]);

  // ====== Fetch Reviews ======
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/reviews/${productId}`);
        const reviewsData = Array.isArray(response.data) ? response.data : [];

        setReviews(
          reviewsData.map((r: any) => ({
            userName: r.userName || r.user || "Anonymous",
            rating: r.rating || 0,
            comment: r.comment || "",
          }))
        );
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews");
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  // ====== Fetch User Info & Cart ======
  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const response = await axios.get<{ id: string; role: string }>(`${BASE_URL}/check-cookie`, {
          withCredentials: true,
        });

        setId(response.data.id);
        setRole(response.data.role);

        if (["Customer", "Company"].includes(response.data.role)) {
          setUserLoggedIn(true);
          try {
            const cartResponse = await axios.get<{ cart: Cart }>(
              `${BASE_URL}/cart/${response.data.id}`
            );

            const cartData: Cart = {
              products: cartResponse.data.cart.products.map((p: any) => ({
                _id: p._id || `cart-item-${Date.now()}-${Math.random()}`,
                productId: p.productId,
                quantity: p.quantity,
                name: p.name,
                subtitle: p.subtitle,
                unitPrice: p.unitPrice,
                MRP: p.MRP,
                averageRating: p.averageRating,
                numberOfReviews: p.numberOfReviews,
                statSubus: p.statSubus,
                imageUrl: p.imageUrl || ProductImage2.src,
              })),
            };

            setCart(cartData);
            setNumberOfCartItems(cartData.products.length);
          } catch {
            console.log("User has no cart yet");
          }
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch {
        setUserLoggedIn(false);
      }
    };
    fetchUserAndCart();
  }, [router]);

  // ====== Quantity Handlers ======
  const handleIncreaseQuantity = () => setQuantity((prev) => prev + 1);
  const handleDecreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  // ====== Cart Handlers ======
  const addToCart = async () => {
    if (!userLoggedIn) return router.push("/login");

    try {
      const response = await axios.post(
        `${BASE_URL}/cart`,
        { productId, userId: id, quantity },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setCart((prev) => {
          const existingIndex = prev.products.findIndex((p) => p.productId === productId);
          const newProducts = [...prev.products];
          if (existingIndex >= 0) {
            newProducts[existingIndex].quantity += quantity;
          } else {
            newProducts.push({
              _id: response.data.cartItemId || `cart-item-${Date.now()}-${Math.random()}`,
              productId,
              quantity,
              name: productDetails?.name,
              unitPrice: productDetails?.unitPrice,
              imageUrl: productDetails?.imageUrl || ProductImage2.src,
            });
          }
          setNumberOfCartItems(newProducts.length);
          return { products: newProducts };
        });
      } else {
        setError("Failed to add product to cart");
      }
    } catch (err) {
      console.error("Error adding product to cart:", err);
      setError("Failed to add product to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!userLoggedIn) return router.push("/login");
    await addToCart();
    router.push("/cart");
  };

  // ====== Review Handler ======
  const handleReviewSubmit = async () => {
    if (!userLoggedIn) return router.push("/login");

    try {
      await axios.post(`${BASE_URL}/reviews`, {
        productId,
        userId: id,
        comment: userReview,
        rating: userRating,
      });
      setReviews((prev) => [...prev, { userName: "You", comment: userReview, rating: userRating }]);
      setUserReview("");
      setUserRating(0);
      setError(null);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review");
    }
  };

  return (
    <div>
      <Navigation
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
        productsDetail={
          productDetails ? [{ ...productDetails, imageUrl: productDetails.imageUrl || ProductImage2.src }] : []
        }
        numberOfCartItems={numberOfCartItems}
      />

      {error && <div className="text-red-500 text-center">{error}</div>}

      {productDetails && (
        <div>
          {/* Product details section remains same as your original code */}
          {/* ... */}
          <Max />
          <Footer />
        </div>
      )}
    </div>
  );
};

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading product...</div>}>
      <ProductPageComponent />
    </Suspense>
  );
}
