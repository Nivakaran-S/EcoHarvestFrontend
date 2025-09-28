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
import Loading from "../components/Loading";

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

interface ApiProductResponse {
  _id: string;
  vendorId: string;
  name: string;
  subtitle: string;
  quantity: number;
  unitPrice: number;
  category: string;
  productCategory_id: string;
  imageUrl: string;
  status: string;
  createdAt: string;
  __v: number;
  MRP: number;
  averageRating: number;
  numberOfReviews: number;
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

  // ====== Get URL Parameters ======
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
  const [loading, setLoading] = useState<boolean>(true);
  const [productNotFound, setProductNotFound] = useState<boolean>(false);

  // ====== Fetch Product Details ======
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching product details for ID: ${productId}`);
        
        const response = await axios.get(
          `${BASE_URL}/products/${productId}`,
          {
            timeout: 10000, // 10 second timeout
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        console.log('Raw API response:', response);
        console.log('Response data:', response.data);
        
        if (!response.data) {
          throw new Error('No data received from API');
        }

        // Handle the case where API returns data nested under numeric keys
        let productData: ApiProductResponse;
        if (response.data["0"]) {
          // Data is nested under "0" key
          productData = response.data["0"];
        } else if (response.data.id || response.data._id) {
          // Data is directly in response.data
          productData = response.data;
        } else {
          // Check if it's an array and take the first element
          if (Array.isArray(response.data) && response.data.length > 0) {
            productData = response.data[0];
          } else {
            throw new Error('Invalid data format received from API');
          }
        }

        console.log('Extracted product data:', productData);

        if (!productData.name || !productData.unitPrice) {
          throw new Error('Missing required product fields');
        }

        const fetched: ProductDetail = {
          id: productData._id || productData._id,
          name: productData.name,
          subtitle: productData.subtitle,
          unitPrice: productData.unitPrice,
          MRP: productData.MRP,
          averageRating: productData.averageRating || 0,
          numberOfReviews: productData.numberOfReviews || 0,
          statSubus: productData.status || productData.status,
          imageUrl: productData.imageUrl && productData.imageUrl !== ProductImage2.src 
            ? productData.imageUrl 
            : ProductImage2.src,
        };
        
        console.log('Processed product details:', fetched);
        setProductDetails(fetched);
        setProductNotFound(false);
        
      } catch (err: any) {
        console.error("Error fetching product details:", err);
        
        if (err.response?.status === 404) {
          setProductNotFound(true);
          setError("Product not found");
        } else if (err.code === 'ECONNABORTED') {
          setError("Request timeout - please try again");
        } else if (err.response?.status >= 500) {
          setError("Server error - please try again later");
        } else if (!navigator.onLine) {
          setError("No internet connection");
        } else {
          setError(err.response?.data?.message || err.message || "Failed to load product details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]); // Add productId as dependency

  // ====== Debug Effect ======
  useEffect(() => {
    console.log('Current state:', {
      productId,
      loading,
      error,
      productDetails,
      productNotFound
    });
  }, [productId, loading, error, productDetails, productNotFound]);

  // ====== Fetch Reviews ======
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      try {
        console.log(`Fetching reviews for product ID: ${productId}`);
        const response = await axios.get<Review[]>(
          `${BASE_URL}/reviews/${productId}`,
          { timeout: 8000 }
        );
        console.log('Reviews response:', response.data);
        setReviews(response.data || []);
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        // Don't set error state for reviews as it's not critical
        setReviews([]);
      }
    };
    
    if (productId && !loading && productDetails) {
      fetchReviews();
    }
  }, [productId, loading, productDetails]);

  // ====== Fetch User Info & Cart ======
  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const response = await axios.get<{ id: string; role: string }>(
          `${BASE_URL}/check-cookie`,
          {
            withCredentials: true,
            timeout: 8000
          }
        );

        console.log('User check response:', response.data);
        setId(response.data.id);
        setRole(response.data.role);

        if (["Customer", "Company"].includes(response.data.role)) {
          setUserLoggedIn(true);
          
          // Fetch cart
          try {
            const cartResponse = await axios.get<{ cart: Cart; products: ProductDetail[] }>(
              `${BASE_URL}/cart/${response.data.id}`,
              { timeout: 8000 }
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
          } catch (cartErr) {
            console.log("User has no cart yet or cart fetch failed:", cartErr);
            setCart({ products: [] });
            setNumberOfCartItems(0);
          }
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch (userErr) {
        console.log("User not logged in:", userErr);
        setUserLoggedIn(false);
        setId("");
        setRole("");
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
    if (!userLoggedIn) {
      router.push("/login");
      return;
    }

    if (!productDetails) {
      setError("Product details not loaded");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/cart`,
        { 
          productId, 
          userId: id, 
          quantity 
        },
        { 
          withCredentials: true, 
          headers: { "Content-Type": "application/json" },
          timeout: 8000
        }
      );

      console.log('Add to cart response:', response.data);

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
              name: productDetails.name,
              subtitle: productDetails.subtitle,
              unitPrice: productDetails.unitPrice,
              MRP: productDetails.MRP,
              averageRating: productDetails.averageRating,
              numberOfReviews: productDetails.numberOfReviews,
              statSubus: productDetails.statSubus,
              imageUrl: productDetails.imageUrl || ProductImage2.src,
            });
          }
          
          setNumberOfCartItems(newProducts.length);
          return { products: newProducts };
        });
        
        
      } 
      window.location.reload()
    } catch (err: any) {
      console.error("Error adding product to cart:", err);
      setError(err.response?.data?.message || "Failed to add product to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!userLoggedIn) {
      router.push("/login");
      return;
    }
    
    await addToCart();
    
  };

  // ====== Review Handler ======
  const handleReviewSubmit = async () => {
    if (!userLoggedIn) {
      router.push("/login");
      return;
    }

    if (!userReview.trim() || userRating === 0) {
      setError("Please provide both rating and review comment");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/reviews`,
        {
          productId,
          userId: id,
          comment: userReview,
          rating: userRating,
        },
        { timeout: 8000 }
      );
      
      console.log('Review submission response:', response.data);
      
      setReviews((prev) => [
        ...prev, 
        { 
          userName: "You", 
          comment: userReview, 
          rating: userRating 
        }
      ]);
      
      setUserReview("");
      setUserRating(0);
      setError(null);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.message || "Failed to submit review");
    }
  };

  // ====== Retry Handler ======
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // This will trigger the useEffect to fetch product details again
    window.location.reload();
  };

  // ====== Loading State ======
  if (loading) {
    return (
      <Loading/>
    );
  }

  // ====== Error State ======
  if (error && !productDetails) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F5F5F5] px-4">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            {productNotFound ? "Product Not Found" : "Error Loading Product"}
          </h2>
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <p className="text-xs sm:text-sm text-gray-500 mb-6">Product ID: {productId}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full py-2 px-4 bg-[#FDAA1C] text-black rounded hover:bg-[#e8961a] transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====== No Product Data State ======
  if (!productDetails) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F5F5F5] px-4">
        <div className="text-center">
          <p className="text-lg sm:text-xl text-gray-600">No product data available</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 py-2 px-4 bg-[#FDAA1C] text-black rounded text-sm sm:text-base"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-400 to-[#F5F5F5] overflow-x-hidden flex flex-col items-center justify-center">
      <Navigation
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
        productsDetail={[{ ...productDetails, imageUrl: productDetails.imageUrl || ProductImage2.src }]}
        numberOfCartItems={numberOfCartItems}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-4 text-sm">
          <p>{error}</p>
        </div>
      )}

      {/* Product Section */}
      <div className="text-black bg-[#F5F5F5] w-full flex flex-col items-center space-y-6 lg:space-y-10">
        <div className="pt-[12vh] sm:pt-[16vh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-400 to-[#F5F5F5] w-full h-full">
          <div className="w-[95%] sm:w-[90%] lg:w-[80vw] flex flex-col lg:flex-row justify-center items-start lg:items-center rounded-[15px] overflow-hidden gap-4 lg:gap-0">
            
            {/* Product Image - Mobile First */}
            <div className="w-full lg:w-[61.8%] flex flex-col items-center justify-center order-1 lg:order-2 h-[40vh] sm:h-[50vh] lg:h-[83vh] space-y-[20px] lg:space-y-[30px]">
              <div className="w-full h-full relative flex justify-center items-center lg:items-end">
                <Image
                  alt={`${productDetails.name} - Product Image`}
                  src={productDetails.imageUrl || ProductImage2}
                  height={250}
                  width={250}
                  className="sm:h-[300px] sm:w-[300px] lg:h-[350px] lg:w-[350px] object-contain"
                  priority
                  sizes="(max-width: 640px) 250px, (max-width: 1024px) 300px, 350px"
                  onError={(e) => {
                    console.log('Image failed to load, using fallback');
                    e.currentTarget.src = ProductImage2.src;
                  }}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full lg:w-[38.2%] lg:ml-[10px] border-[0.5px] border-gray-500 rounded-[10px] bg-[#F5F5F5] order-2 lg:order-1 h-auto lg:h-[70vh] lg:mb-[40px] p-4 sm:p-[20px] relative">
              {!!discountPercentage && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] sm:text-[12px] px-2 sm:px-3 py-[2px] sm:py-[3px] rounded-bl-lg font-semibold shadow-md z-10">
                  -{discountPercentage}%
                </div>
              )}

              <p className="text-xl sm:text-2xl lg:text-[28px] w-[90%] lg:w-[80%] leading-tight sm:leading-[32px]">{productDetails.name}</p>

              {/* Rating */}
              <div className="flex relative items-start sm:items-center justify-between mt-2 flex-col sm:flex-row gap-2 sm:gap-0">
                <div>
                  <p className="text-base sm:text-lg lg:text-[20px] ml-2 lg:ml-[10px] text-orange-500">{productDetails.subtitle}</p>
                  <div className="flex flex-row items-center mt-2 lg:mt-[10px] space-x-[3px]">
                    <StarRating onChange={() => {}} rating={productDetails.averageRating} />
                    <p className="text-gray-700 text-xs sm:text-[13px] flex items-center">
                      <span className="text-sm sm:text-[15px]">{productDetails.averageRating}</span> ({productDetails.numberOfReviews})
                    </p>
                  </div>
                </div>

                <div className="static sm:absolute sm:top-[10px] sm:right-0 flex flex-col items-center">
                  <div className="rounded-full bg-[#FDAA1C] text-black ring-gray-800 ring-[0.5px] px-3 sm:px-[15px] py-1 sm:py-[0px] cursor-pointer">
                    <p className="text-xs sm:text-[13px]">Ask Max</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex justify-between mt-4 sm:mt-[20px]">
                <div>
                  {discountPrice ? (
                    <>
                      <p className="text-2xl sm:text-3xl lg:text-[35px] mt-[5px]">Rs. {discountPrice}</p>
                      <p className="text-sm sm:text-[15px] text-gray-600 pl-[5px]">
                        <s>MRP: Rs. {productDetails.unitPrice}</s>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl sm:text-3xl lg:text-[35px] mt-[5px]">Rs. {productDetails.unitPrice}</p>
                      <p className="text-sm sm:text-[15px] text-gray-600 pl-[5px]">
                        <s>MRP: Rs. {productDetails.MRP}</s>
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-green-800 text-base sm:text-lg lg:text-[19px]">{productDetails.statSubus}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center my-3 sm:my-[10px]">
                <div className="flex items-center space-x-2 sm:space-x-[10px]">
                  <p className="text-lg sm:text-[20px]">Quantity</p>
                  <div className="flex items-center justify-center w-[80px] sm:w-[90px] h-[35px] sm:h-[30px] rounded-[5px] ring-[1px] ring-gray-400 bg-white">
                    <div className="px-2 sm:px-[10px] cursor-pointer flex items-center justify-center" onClick={handleDecreaseQuantity}>
                      <div className="bg-black h-[2px] w-[8px] sm:w-[10px]" />
                    </div>
                    <input
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-full text-lg sm:text-[20px] text-center focus:outline-none"
                    />
                    <div className="px-2 sm:px-[10px] cursor-pointer flex items-center justify-center" onClick={handleIncreaseQuantity}>
                      <p className="text-lg sm:text-[20px]">+</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtotal & Delivery */}
              <div className="flex flex-col space-y-2 sm:space-y-[8px] mt-4 sm:mt-[15px] text-sm sm:text-[15px]">
                <div className="flex justify-between text-base sm:text-[18px]">
                  <p>Delivery</p>
                  <p>Colombo, Sri Lanka</p>
                </div>
                <div className="flex justify-between text-base sm:text-[18px]">
                  <p>Sub Total</p>
                  <p>Rs. {quantity * (discountPrice || productDetails.unitPrice)}</p>
                </div>
              </div>

              {/* Add to Cart & Buy Now */}
              <div className="flex flex-col space-y-2 sm:space-y-[8px] mt-4 sm:mt-[15px]">
                <button
                  onClick={addToCart}
                  className="w-full py-3 sm:py-[5px] bg-[#FDAA1C] rounded flex justify-center items-center cursor-pointer hover:bg-[#e8961a] transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 sm:py-[5px] bg-[#101010] text-white rounded flex justify-center items-center cursor-pointer hover:bg-[#333] transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Buy now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="w-[95%] sm:w-[90%] lg:w-[70vw] pb-[50px] flex flex-col">
          <div className="bg-white py-4 sm:py-[20px] px-4 sm:px-[25px] ring-[0.5px] ring-gray-500 rounded-[15px] mt-[10px] w-full">
            <p className="text-xl sm:text-2xl lg:text-[25px] mb-4">Reviews & Ratings</p>
            <div className="flex flex-col space-y-3 sm:space-y-[10px]">
              {reviews.length > 0 ? (
                reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 ring-[0.5px] ring-gray-500 p-3 sm:p-[10px] rounded-[10px] flex flex-col space-y-2 sm:space-y-[10px] min-h-[20vh] sm:h-[22vh]"
                  >
                    <div className="flex justify-between items-start sm:items-center">
                      <div className="flex items-center space-x-[8px]">
                        <div className="rounded-full bg-white ring-[0.5px] ring-gray-500 h-[35px] w-[35px] sm:h-[40px] sm:w-[40px]" />
                        <div className="flex flex-col leading-tight sm:leading-[21px]">
                          <p className="text-base sm:text-lg lg:text-[19px]">{review.userName}</p>
                          <StarRating onChange={() => {}} rating={review.rating} hoverStar={false} />
                        </div>
                      </div>
                    </div>
                    <p className="ml-2 sm:ml-[10px] text-sm sm:text-base">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 sm:px-[30px] flex flex-col items-center py-4 sm:py-[10px]">
                  <p className="text-sm sm:text-base">No reviews for this product</p>
                  <p className="text-sm sm:text-base">Be the first to review this product</p>
                </div>
              )}

              {userLoggedIn ? (
                <div className="bg-white mt-3 sm:mt-[10px] ring-[0.5px] ring-gray-500 w-full py-4 sm:py-[15px] px-4 sm:px-[25px] rounded-[10px] flex flex-col space-y-3 sm:space-y-[10px]">
                  <p className="text-lg sm:text-[20px]">Write a Review</p>
                  <StarRating rating={userRating} hoverStar={true} onChange={setUserRating} />
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    className="ring-[0.5px] ring-gray-500 h-[80px] sm:h-[100px] rounded-[10px] px-4 sm:px-[20px] py-3 sm:py-[10px] focus:outline-none text-sm sm:text-base"
                    placeholder="Enter review"
                  />
                  <button
                    onClick={handleReviewSubmit}
                    className="bg-[#FDAA1C] py-3 sm:py-[5px] rounded-[5px] w-full flex justify-center items-center cursor-pointer hover:bg-[#e8961a] transition-colors text-sm sm:text-base"
                  >
                    Submit review
                  </button>
                </div>
              ) : (
                <div className="bg-gray-300 flex flex-col items-center py-4 sm:py-[10px] rounded-[5px] mt-3 sm:mt-[10px]">
                  <p className="text-sm sm:text-base">Please Login to submit review</p>
                  <button
                    onClick={() => router.push("/login")}
                    className="bg-[#FDAA1C] px-4 sm:px-[25px] py-2 sm:py-[5px] mt-3 sm:mt-[10px] rounded-[5px] cursor-pointer hover:bg-[#e8961a] transition-colors text-sm sm:text-base"
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
    <Suspense>
      <ProductPageComponent/>
    </Suspense>
  )
}