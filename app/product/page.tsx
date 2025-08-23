"use client";
import { Suspense, useState, useEffect } from "react";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import Image from "next/image";
import ProductImage2 from "../images/product.png";
import Star from "../images/log.png";
import Max from "../components/Max";
import ProductComp from "../components/Product"; // ✅ renamed import
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import StarRating from "../components/StarRating";
import * as React from "react";

const BASE_URL = "https://eco-harvest-backend.vercel.app";

interface Product {
  name: string;
  subtitle: string;
  averageRating: number;
  numberOfReviews: number;
  unitPrice: number;
  MRP: number;
  statSubus: string;
}

interface Review {
  userName: string;
  rating: number;
  comment: string;
}

interface Cart {
  products: any[];
}

const ProductPage: React.FC = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || "";
  const discountPrice = searchParams.get("discountPrice");
  const discountPercentage = searchParams.get("discountPercentage");

  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<Cart>({ products: [] });
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [productDetails, setProductDetails] = useState<Product[]>([]);
  const [product, setProduct] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<string>("");
  const [userRating, setUserRating] = useState<number>(0);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);

  const router = useRouter();

  const handleReviewSubmit = async (): Promise<void> => {
    try {
      const response = await axios.post(`${BASE_URL}/reviews/`, {
        productId,
        userId: id,
        comment: userReview,
        rating: userRating,
      });
      console.log("Review submitted successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async (): Promise<void> => {
      try {
        const response = await axios.get<Product[]>(
          `${BASE_URL}/products/${productId}`
        );
        setProductDetails(response.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };
    if (productId) fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    const fetchReviews = async (): Promise<void> => {
      try {
        const response = await axios.get<Review[]>(
          `${BASE_URL}/reviews/${productId}`
        );
        setReviews(response.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  useEffect(() => {
    const fetchCookies = async (): Promise<void> => {
      try {
        const response = await axios.get<{ id: string; role: string }>(
          `${BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        setId(response.data.id);
        setRole(response.data.role);

        if (response.data.role === "Customer" || response.data.role === "Company") {
          setUserLoggedIn(true);
          try {
            const response2 = await axios.get<{
              cart: Cart;
              products: any[];
            }>(`${BASE_URL}/cart/${response.data.id}`);
            setCart(response2.data.cart);
            setProduct(response2.data.products);
            setNumberOfCartItems(response2.data.cart.products.length);
          } catch (err) {
            console.log("Error fetching cart:", err);
          }
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch (error) {
        setUserLoggedIn(false);
      }
    };

    fetchCookies();
  }, [router]);

  const handleIncreaseQuantity = (): void => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = (): void => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async (): Promise<void> => {
    try {
      if (!userLoggedIn) {
        router.push("/login");
        return;
      }
      const response = await axios.post<{ success: boolean }>(
        `${BASE_URL}/cart/`,
        { productId, userId: id, quantity },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        console.log("Product added to cart");
      }
      window.location.reload();
    } catch (err) {
      console.error("Error adding product to cart:", err);
    }
  };

  const handleAddToCart2 = async (): Promise<void> => {
    try {
      if (!userLoggedIn) {
        router.push("/login");
        return;
      }
      await axios.post<{ success: boolean }>(
        `${BASE_URL}/cart/`,
        { productId, userId: id, quantity },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("Error adding product to cart:", err);
    }
  };

  const handleBuyNow = async (): Promise<void> => {
    if (!userLoggedIn) {
      router.push("/login");
      return;
    }
    await handleAddToCart2();
    router.push("/cart");
  };

  return (
    <div>
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={product}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />
      {productDetails.map((product, index) => (
        <div key={index}>
          {/* ---- Product Details ---- */}
          <div className="text-black bg-[#F5F5F5] w-full flex flex-col space-y-[10px] justify-center items-center">
            {/* your UI code unchanged... */}
          </div>

          {/* Max and Footer */}
          <Max />
          <Footer />
        </div>
      ))}
    </div>
  );
};

// ✅ Wrapper with Suspense, renamed
function ProductPageWrapper(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductPage />
    </Suspense>
  );
}

export default ProductPageWrapper;
