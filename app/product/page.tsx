"use client";

import React, { useState, useEffect, ChangeEvent, Suspense } from "react";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import StarRating from "../components/StarRating";

import Image from "next/image";
import ProductImage2 from "../images/product.png";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

// Import your Max component
import Max from "../components/Max";

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
  status?: string;
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
  status?: string;
  imageUrl?: string;
}

interface Cart {
  products: CartItem[];
}

const ProductPageComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = searchParams.get("productId") || "";

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
  const [productLoading, setProductLoading] = useState<boolean>(true);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);

  // A no-op function to pass to the display-only StarRating component
  const handleNoRatingChange = () => {};

  // ====== Fetch Product Details ======
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setProductLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}/products/${productId}`);
        const data = response.data;

        setProductDetails({
          id: data.id || data._id || productId,
          name: data.name,
          subtitle: data.subtitle,
          unitPrice: data.unitPrice,
          MRP: data.MRP,
          averageRating: data.averageRating || 0,
          numberOfReviews: data.numberOfReviews || 0,
          status: data.status,
          imageUrl: data.imageUrl || ProductImage2.src,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
      } finally {
        setProductLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  // ====== Fetch Reviews ======
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) {
        setReviewsLoading(false);
        return;
      }
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
        setError(null);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews.");
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
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
                ...p,
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
        setError(null);
      } else {
        setError("Failed to add product to cart");
      }
    } catch (err) {
      console.error("Error adding product to cart:", err);
      setError("Failed to add product to cart.");
    }
  };

  const handleBuyNow = async () => {
    if (!userLoggedIn) {
      router.push("/login");
      return;
    }
    await addToCart();
    router.push("/cart");
  };

  // ====== Review Handler ======
  const handleReviewSubmit = async () => {
    if (!userLoggedIn) {
      router.push("/login");
      return;
    }
    if (!userReview || userRating === 0) {
      setError("Please provide both a rating and a comment.");
      return;
    }

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
      setError("Failed to submit review.");
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

      {error && <div className="text-red-500 text-center p-4">{error}</div>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {productLoading ? (
          <div className="flex justify-center items-center h-48">
            <p>Loading product details...</p>
          </div>
        ) : (
          productDetails && (
            <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 bg-white rounded-lg shadow-lg">
              <div className="md:w-1/2">
                <div className="relative w-full h-[400px]">
                  <Image
                    src={productDetails.imageUrl}
                    alt={productDetails.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col justify-start">
                <h1 className="text-4xl font-bold text-gray-800">{productDetails.name}</h1>
                <p className="mt-2 text-xl text-gray-600">{productDetails.subtitle}</p>

                <div className="mt-4 flex items-center gap-2">
                  <StarRating
                    rating={productDetails.averageRating}
                    onChange={handleNoRatingChange}
                  />
                  <span className="text-yellow-500 font-semibold text-lg">
                    {productDetails.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({productDetails.numberOfReviews} reviews)
                  </span>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-baseline gap-4">
                  <span className="text-3xl font-bold text-green-600">
                    ${productDetails.unitPrice.toFixed(2)}
                  </span>
                  {productDetails.MRP > productDetails.unitPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ${productDetails.MRP.toFixed(2)}
                    </span>
                  )}
                  {productDetails.MRP > productDetails.unitPrice && (
                    <span className="text-lg font-semibold text-red-500">
                      {`Save ${((1 - productDetails.unitPrice / productDetails.MRP) * 100).toFixed(0)}%`}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-gray-700">{productDetails.status}</p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={handleDecreaseQuantity}
                      className="px-3 py-1 text-gray-600 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center focus:outline-none"
                      min="1"
                    />
                    <button
                      onClick={handleIncreaseQuantity}
                      className="px-3 py-1 text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={addToCart}
                    className="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          )
        )}
        
        {/* Reviews Section */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Customer Reviews</h2>

          {reviewsLoading ? (
            <p className="mt-4">Loading reviews...</p>
          ) : (
            reviews.length > 0 ? (
              <ul className="mt-4 space-y-6">
                {reviews.map((review, index) => (
                  <li key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={review.rating}
                        onChange={handleNoRatingChange}
                      />
                      <span className="text-gray-700 font-semibold">{review.userName}</span>
                    </div>
                    <p className="mt-2 text-gray-600">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-gray-500">No reviews yet. Be the first to review this product!</p>
            )
          )}
        </div>

        {/* Submit Review Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Write a Review</h3>
          <div className="mt-4">
            <label htmlFor="rating" className="block text-gray-700 font-medium mb-2">
              Your Rating
            </label>
            <StarRating
              rating={userRating}
              onChange={setUserRating}
              hoverStar={true}
            />

            <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
              Your Comment
            </label>
            <textarea
              id="comment"
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder="Tell us what you think about this product..."
            ></textarea>
            <button
              onClick={handleReviewSubmit}
              className="mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 disabled:bg-gray-400"
              disabled={!userLoggedIn}
            >
              Submit Review
            </button>
            {!userLoggedIn && (
              <p className="mt-2 text-sm text-red-500">You must be logged in to submit a review.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <Max />
    </div>
  );
};

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <ProductPageComponent />
    </Suspense>
  );
}