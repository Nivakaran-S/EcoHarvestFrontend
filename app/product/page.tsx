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
  const [loading, setLoading] = useState<boolean>(true); // Add a loading state

  // ====== Fetch Product Details ======
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get<ProductDetail>(`${BASE_URL}/products/${productId}`);
        const fetched = {
          ...response.data,
          imageUrl: response.data.imageUrl || ProductImage2.src,
        };
        console.log('Product details: ', fetched)
        setProductDetails(fetched);
        setLoading(false); // Set loading to false on success
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
        setLoading(false); // Set loading to false on error
      }
    };
    if (productId) {
      setLoading(true); // Set loading to true before fetching
      fetchProductDetails();
    }
  }, []);

  useEffect(() => {
    console.log('Product Details Fetched', productDetails)
  }, []);

  // ====== Fetch Reviews ======
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>(`${BASE_URL}/reviews/${productId}`);
        setReviews(response.data);
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
            const cartResponse = await axios.get<{ cart: Cart; products: ProductDetail[] }>(
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

  // Conditional rendering based on loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading product details...</p>
      </div>
    );
  }

  // Conditional rendering for error state
  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        <p>{error}</p>
      </div>
    );
  }

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

      {/* Product Section */}
      <div className="text-black bg-[#F5F5F5] w-full flex flex-col items-center space-y-10">
        <div className="bg-gradient-to-b pt-[16vh] flex flex-col items-center justify-center from-gray-400 to-[#F5F5F5] w-full h-full">
          <div className="w-[94vw] flex justify-center items-center rounded-[15px] overflow-hidden">
            {/* Product Info */}
            <div className="w-[38.2%] ml-[10px] border-[0.5px] border-gray-500 rounded-[10px] bg-[#F5F5F5] h-[70vh] mb-[40px] p-[20px] relative">
              {!!discountPercentage && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[12px] px-3 py-[3px] rounded-bl-lg font-semibold shadow-md z-10">
                  -{discountPercentage}%
                </div>
              )}

              <p className="text-[28px] w-[80%] leading-[32px]">{productDetails?.name}</p>

              {/* Rating */}
              <div className="flex relative items-center justify-between mt-2">
                <div>
                  <p className="text-[20px] ml-[10px] text-orange-500">{productDetails?.subtitle}</p>
                  <div className="flex flex-row items-center mt-[10px] space-x-[3px]">
                    <StarRating onChange={() => {}} rating={productDetails?.averageRating} />
                    <p className="text-gray-700 text-[13px] flex items-center">
                      <span className="text-[15px]">{productDetails?.averageRating}</span> ({productDetails?.numberOfReviews})
                    </p>
                  </div>
                </div>

                <div className="absolute top-[10px] right-0 flex flex-col items-center">
                  <div className="rounded-full bg-[#FDAA1C] text-black ring-gray-800 ring-[0.5px] px-[15px] py-[0px] cursor-pointer">
                    <p className="text-[13px]">Ask Max</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex justify-between mt-[20px]">
                <div>
                  {discountPrice ? (
                    <>
                      <p className="text-[35px] mt-[5px]">Rs. {discountPrice}</p>
                      <p className="text-[15px] text-gray-600 pl-[5px]">
                        <s>MRP: Rs. {productDetails?.unitPrice}</s>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[35px] mt-[5px]">Rs. {productDetails?.unitPrice}</p>
                      <p className="text-[15px] text-gray-600 pl-[5px]">
                        <s>MRP: Rs. {productDetails?.MRP}</s>
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-green-800 text-[19px]">{productDetails?.statSubus}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center my-[10px]">
                <div className="flex items-center space-x-[10px]">
                  <p className="text-[20px]">Quantity</p>
                  <div className="flex items-center justify-center w-[90px] h-[30px] rounded-[5px] ring-[1px] ring-gray-400 bg-white">
                    <div className="px-[10px] cursor-pointer" onClick={handleDecreaseQuantity}>
                      <div className="bg-black h-[1px] w-[10px]" />
                    </div>
                    <input
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-full text-[20px] text-center focus:outline-none"
                    />
                    <div className="px-[10px] cursor-pointer" onClick={handleIncreaseQuantity}>
                      <p className="text-[20px]">+</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtotal & Delivery */}
              <div className="flex flex-col space-y-[8px] mt-[15px] text-[15px]">
                <div className="flex justify-between text-[18px]">
                  <p>Delivery</p>
                  <p>Colombo, Sri Lanka</p>
                </div>
                <div className="flex justify-between text-[18px]">
                  <p>Sub Total</p>
                  <p>Rs. {quantity * (discountPrice || productDetails?.unitPrice || 0)}</p>
                </div>
              </div>

              {/* Add to Cart & Buy Now */}
              <div className="flex flex-col space-y-[8px] mt-[15px]">
                <button
                  onClick={addToCart}
                  className="w-full py-[5px] bg-[#FDAA1C] rounded flex justify-center items-center cursor-pointer"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-[5px] bg-[#101010] text-white rounded flex justify-center items-center cursor-pointer"
                >
                  Buy now
                </button>
              </div>
            </div>

            {/* Product Image */}
            <div className="w-[61.8%] flex flex-col items-center justify-center h-[83vh] space-y-[30px]">
              <div className="w-full h-[350px] relative flex justify-center items-end">
                <Image
                  alt="Product Image"
                  src={productDetails?.imageUrl || ProductImage2}
                  height={350}
                  width={350}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="w-[94vw] pb-[50px] flex flex-col">
          <div className="bg-white py-[20px] px-[25px] ring-[0.5px] ring-gray-500 rounded-[15px] mt-[10px] w-full">
            <p className="text-[25px]">Reviews & Ratings</p>
            <div className="flex flex-col space-y-[10px]">
              {reviews.length > 0 ? (
                reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 ring-[0.5px] ring-gray-500 p-[10px] rounded-[10px] flex flex-col space-y-[10px] h-[22vh]"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-[8px]">
                        <div className="rounded-full bg-white ring-[0.5px] ring-gray-500 h-[40px] w-[40px]" />
                        <div className="flex flex-col leading-[21px]">
                          <p className="text-[19px]">{review.userName}</p>
                          <StarRating onChange={() => {}} rating={review.rating} hoverStar={false} />
                        </div>
                      </div>
                    </div>
                    <p className="ml-[10px]">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="px-[30px] flex flex-col items-center py-[10px]">
                  <p>No reviews for this product</p>
                  <p>Be the first to review this product</p>
                </div>
              )}

              {userLoggedIn ? (
                <div className="bg-white mt-[10px] ring-[0.5px] ring-gray-500 w-full py-[15px] px-[25px] rounded-[10px] flex flex-col space-y-[10px]">
                  <p className="text-[20px]">Write a Review</p>
                  <StarRating rating={userRating} hoverStar={true} onChange={setUserRating} />
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    className="ring-[0.5px] ring-gray-500 h-[100px] rounded-[10px] px-[20px] py-[10px] focus:outline-none"
                    placeholder="Enter review"
                  />
                  <button
                    onClick={handleReviewSubmit}
                    className="bg-[#FDAA1C] py-[5px] rounded-[5px] w-full flex justify-center items-center cursor-pointer"
                  >
                    Submit review
                  </button>
                </div>
              ) : (
                <div className="bg-gray-300 flex flex-col items-center py-[10px] rounded-[5px] mt-[10px]">
                  <p>Please Login to submit review</p>
                  <button
                    onClick={() => router.push("/login")}
                    className="bg-[#FDAA1C] px-[25px] py-[5px] mt-[10px] rounded-[5px] cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Max />
      <Footer />
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