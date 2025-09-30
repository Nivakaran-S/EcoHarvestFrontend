"use client";

import Footer from "../components/Footer";
import Max from "../components/Max";
import Navigation from "../components/Navigation";
import Image from "next/image";
import ProductImage from "../images/product.png";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import EmptyCart from "../images/emptyCart.png";
import Loading from "../components/Loading";

const API_BASE_URL = "https://eco-harvest-backend.vercel.app";

// Interfaces
interface CartItem {
  _id: string;
  quantity: number;
}

interface Cart {
  products: CartItem[];
  totalAmount: number;
}

interface Product {
  _id: string;
  name: string;
  subtitle: string;
  averageRating: number;
  imageUrl: string;
  MRP: number;
  unitPrice: number;
}

interface Advertisement {
  title: string;
  description: string;
  imageUrl: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  orderTime: string;
  status: string;
  totalAmount: number;
  products: Array<{
    productId: Product;
    quantity: number;
    unitPrice: number;
  }>;
}

const OrderHistory: React.FC = () => {
  const [isFixed, setIsFixed] = useState<boolean>(true);
  const targetRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);

  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart>({ products: [], totalAmount: 0 });
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [productsDetail, setProductsDetail] = useState<Product[]>([]);
  const [updateBtnVisible, setUpdateBtnVisible] = useState<boolean>(false);
  const [advertisement, setAdvertisement] = useState<Advertisement[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const router = useRouter();

  // Initial data fetch
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const adPromise = axios.get<Advertisement[]>(`${API_BASE_URL}/advertisement/`);
        const cookiePromise = axios.get<{ id: string; role: string }>(
          `${API_BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        const [adRes, cookieRes] = await Promise.all([adPromise, cookiePromise]);
        setAdvertisement(adRes.data);

        const userId = cookieRes.data.id;
        setId(userId);
        setRole(cookieRes.data.role);

        if (cookieRes.data.role === "Customer") {
          setUserLoggedIn(true);
          try {
            const cartRes = await axios.get<{ cart: Cart; products: Product[] }>(
              `${API_BASE_URL}/cart/${userId}`
            );
            setCart(cartRes.data.cart);
            setProductsDetail(cartRes.data.products);
            setNumberOfCartItems(cartRes.data.cart.products.length);
          } catch {
            console.log("Cart Empty");
          }

          try {
            const orderRes = await axios.get<Order[]>(`${API_BASE_URL}/orders/history/${userId}`);
            setOrderHistory(orderRes.data);
          } catch {
            console.log("No order history");
          }
        } else if (cookieRes.data.role === "Vendor") {
          router.push("/vendor");
        } else if (cookieRes.data.role === "Admin") {
          router.push("/admin");
        }
        setLoading(false);
      } catch (err) {
        router.push("/login");
      }
    };

    fetchAll();
  }, [router]);

  const handleCheckout = async (): Promise<void> => {
    if (userLoggedIn) {
      try {
        const response = await axios.post(`${API_BASE_URL}/orders/checkout`, { cart });
        console.log("Checkout response:", response);
        router.push("/checkout");
      } catch (error) {
        console.error("Checkout error:", error);
      }
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    const handleScroll = (): void => {
      if (fixedRef.current && targetRef.current) {
        const fixedHeight = fixedRef.current.clientHeight;
        const targetTop = targetRef.current.getBoundingClientRect().top;
        setIsFixed(targetTop > fixedHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('deliver')) return 'bg-green-100 text-green-800 border-green-300';
    if (normalizedStatus.includes('process') || normalizedStatus.includes('pending')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (normalizedStatus.includes('cancel')) return 'bg-red-100 text-red-800 border-red-300';
    if (normalizedStatus.includes('ship')) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />
      <div className="pt-[12vh] sm:pt-[17vh] w-full flex items-center justify-center text-gray-900">
        <div className="w-[95%] lg:w-[90%] xl:w-[85%] min-h-[100vh] mt-[20px] flex flex-col lg:flex-row gap-6">
          {/* Left Section */}
          <div className="w-full lg:w-[65%] xl:w-[70%] h-full space-y-6">
            {/* Advertisement Banner */}
            {advertisement[0] && (
              <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-[60%] flex items-center p-6 sm:p-8">
                    <div className="w-full">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        {advertisement[0]?.title}
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base mt-2">
                        {advertisement[0]?.description}
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-[40%] h-[180px] sm:h-auto flex items-center justify-center p-4">
                    <Image
                      src={advertisement[0]?.imageUrl || ProductImage}
                      width={200}
                      height={200}
                      alt="Advertisement"
                      className="rounded-xl object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order History Header */}
            <div className="bg-white rounded-[10px]  p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order History</h1>
                  <p className="text-sm text-gray-500">Track and view your past orders</p>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {orderHistory.length > 0 ? (
                orderHistory.map((order) => {
                  const dateObj = new Date(order.orderTime);
                  const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  const isExpanded = expandedOrders.has(order._id);

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-[15px] shadow-sm border border-gray-300 overflow-hidden transition-all hover:shadow-md"
                    >
                      {/* Order Header */}
                      <div className="p-4 sm:p-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)} w-fit`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-lg font-bold text-gray-900">
                            Total: <span className="text-green-600">Rs. {order.totalAmount.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => toggleOrderExpansion(order._id)}
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                          >
                            {isExpanded ? 'Hide' : 'Show'} Items
                            <svg
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Order Items - Expandable */}
                      {isExpanded && (
                        <div className="p-4 sm:p-6 bg-gray-50 space-y-3">
                          {order.products.map((product) => (
                            <div
                              key={product.productId._id}
                              className="bg-white rounded-xl p-4 border border-gray-200"
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-shrink-0 self-center sm:self-start">
                                  <Image
                                    src={product.productId.imageUrl}
                                    width={80}
                                    height={80}
                                    alt={product.productId.name}
                                    className="rounded-lg object-cover"
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                                      {product.productId.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">{product.productId.subtitle}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                      <span className="text-sm text-gray-600">{product.productId.averageRating}</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <p className="text-gray-500">Quantity</p>
                                      <p className="font-semibold text-gray-900">{product.quantity}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Unit Price</p>
                                      <p className="font-semibold text-gray-900">Rs. {product.unitPrice}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">M.R.P.</p>
                                      <p className="font-semibold text-gray-400 line-through">Rs. {product.productId.MRP}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Total</p>
                                      <p className="font-semibold text-green-600">Rs. {product.unitPrice * product.quantity}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 mb-6">Start shopping to see your order history here</p>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Cart */}
          <div className="w-full lg:w-[35%] xl:w-[30%] h-auto lg:h-screen py-4 lg:py-0">
            <div
              ref={fixedRef}
              className={`${
                isFixed && typeof window !== "undefined" && window.innerWidth >= 1024
                  ? "fixed w-[30%] xl:w-[25%]"
                  : "static w-full"
              } transition-all`}
            >
              {cart.products.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">Rs. {cart.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Charge</span>
                      <span className="font-semibold">Rs. 500</span>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Grand Total</span>
                      <span className="text-green-600">Rs. {(cart.totalAmount + 500).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-md"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      🔒 Secure checkout · Free delivery on orders over Rs. 2000
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                  <Image
                    src={EmptyCart}
                    width={150}
                    height={150}
                    alt="Empty Cart"
                    className="mx-auto mb-6 opacity-80"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add items to get started</p>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div ref={targetRef} className="flex items-center justify-center mt-12">
        <div className="w-[95%]">{/* <YouMightLike /> */}</div>
      </div>
      <Max />
      <Footer />
    </div>
  );
};

export default OrderHistory;