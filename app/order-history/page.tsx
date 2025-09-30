"use client";

import Footer from "../components/Footer";
import Max from "../components/Max";
import Navigation from "../components/Navigation";
import Product from "../components/Product";
import Image from "next/image";
import ProductImage from "../images/product.png";
import YouMightLike from "../components/YouMightLike";
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

  const router = useRouter();

  // Initial data fetch
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Advertisement
        const adPromise = axios.get<Advertisement[]>(`${API_BASE_URL}/advertisement/`);
        // Cookie & cart
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

  // Scroll handler for sticky cart
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

  const handleIncreaseQuantity = (itemId: string): void => {
    setCart((prevCart) => ({
      ...prevCart,
      products: prevCart.products.map((item) =>
        item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
    setUpdateBtnVisible(true);
  };

  const handleDecreaseQuantity = (itemId: string): void => {
    setCart((prevCart) => ({
      ...prevCart,
      products: prevCart.products.map((item) =>
        item._id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      ),
    }));
    setUpdateBtnVisible(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex  flex-col items-center">
            <Loading/>
          </div>
        </div>
    );
  }

  return (
    <div>
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />
      <div className="pt-[12vh] sm:pt-[15vh] bg-white w-full flex items-center justify-center text-black">
        <div className="w-[95%] min-h-[100vh] flex flex-col lg:flex-row">
          {/* Left Section */}
          <div className="w-full lg:w-[76.4%] lg:pr-[20px] h-full">
            <div className="w-full flex flex-col sm:flex-row h-auto sm:h-[150px] md:h-[200px] bg-gray-300 rounded-[10px] mt-[10px] ring-[0.5px] ring-gray-800 overflow-hidden">
              <div className="w-full sm:w-[60%] h-full flex flex-col items-center justify-center p-4">
                <div className="w-full sm:w-[80%]">
                  <p className="text-lg sm:text-xl md:text-[25px] leading-tight sm:leading-[30px]">
                    {advertisement[0]?.title}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base leading-tight sm:leading-[20px] mt-[5px]">
                    {advertisement[0]?.description}
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-[40%] h-[150px] sm:h-full flex items-center justify-center">
                <Image
                  src={advertisement[0]?.imageUrl || ProductImage}
                  width={150}
                  height={100}
                  sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 220px"
                  alt="Advertisement"
                  className="rounded-[10px] object-cover"
                />
              </div>
            </div>

            <p className="text-2xl sm:text-3xl md:text-[35px] px-2 sm:px-[20px] mt-[10px] mb-[5px]">
              Order History
            </p>

            <div className="w-full mt-[10px] mb-[20px] h-full">
              <div className="flex flex-col space-y-[8px] w-full bg-gray-300 rounded-[10px] px-2 sm:px-[10px] py-[9px] ring-[0.5px] ring-gray-500">
                {orderHistory.length > 0 ? (
                  orderHistory.map((item) => {
                    const dateObj = new Date(item.orderTime);
                    const date = dateObj.toISOString().split("T")[0];
                    const time = dateObj.toTimeString().split(" ")[0];

                    return (
                      <div
                        key={item._id}
                        className="w-full min-h-[220px] px-2 sm:pl-[5px] sm:pr-[20px] py-[10px] bg-white rounded-[8px] ring-gray-500 ring-[0.5px] flex flex-col justify-between"
                      >
                        <div className="flex flex-col sm:flex-row px-2 sm:px-[10px] justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                          <div className="text-lg sm:text-[20px]">Order #{item.orderNumber}</div>
                          <div className="bg-gray-300 ring-gray-800 ring-[0.5px] px-[10px] text-sm sm:text-[15px] rounded-[3px] w-fit">
                            {item.status}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row px-2 sm:px-[10px] justify-between space-y-1 sm:space-y-0">
                          <div className="text-sm sm:text-base">Date: {date}</div>
                          <div className="text-sm sm:text-base">Time: {time}</div>
                        </div>
                        <div className="px-2 sm:px-[10px] text-sm sm:text-base">
                          Total amount: Rs. {item.totalAmount}
                        </div>
                        <div className="flex flex-col px-2 sm:px-[10px] bg-gray-200 py-[10px] mt-[5px] w-full rounded-[10px] ring-[0.5px] ring-gray-800">
                          {item.products.map((product) => (
                            <div
                              key={product.productId._id}
                              className="flex flex-col sm:flex-row my-[5px] ring-gray-500 rounded-[5px] py-[10px] ring-[0.5px] items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-[10px] p-2 sm:p-0"
                            >
                              <Image
                                src={product.productId.imageUrl}
                                width={60}
                                height={60}
                                sizes="(max-width: 640px) 60px, 80px"
                                alt="Product"
                                className="rounded-[10px] self-center sm:self-start"
                              />
                              <div className="flex flex-col w-full sm:w-[250px] md:w-[350px] text-center sm:text-left">
                                <p className="text-base sm:text-lg md:text-[20px] leading-tight sm:leading-[20px]">
                                  {product.productId.name}
                                </p>
                                <p className="text-gray-600 text-sm sm:text-base md:text-[18px] sm:pl-[10px]">
                                  {product.productId.subtitle}
                                </p>
                                <p className="text-gray-600 text-sm sm:pl-[10px]">
                                  Rating: {product.productId.averageRating}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 sm:gap-2 w-full sm:w-auto">
                                <div className="flex flex-col w-full sm:w-[100px] md:w-[130px] text-center sm:text-left">
                                  <p className="text-sm sm:text-base">Total Amount</p>
                                  <p className="text-gray-600 text-sm sm:text-base">
                                    Rs. {product.unitPrice * product.quantity}
                                  </p>
                                </div>
                                <div className="flex flex-col w-full sm:w-[80px] md:w-[130px] text-center sm:text-left">
                                  <p className="text-sm sm:text-base">M.R.P.</p>
                                  <p className="text-gray-600 text-sm sm:text-base">
                                    Rs. {product.productId.MRP}
                                  </p>
                                </div>
                                <div className="flex flex-col w-full sm:w-[90px] md:w-[130px] text-center sm:text-left">
                                  <p className="text-sm sm:text-base">Unit Price</p>
                                  <p className="text-gray-600 text-sm sm:text-base">
                                    Rs. {product.productId.unitPrice}
                                  </p>
                                </div>
                                <div className="flex flex-col w-full sm:w-[80px] md:w-[130px] text-center sm:text-left">
                                  <p className="text-sm sm:text-base">Quantity</p>
                                  <p className="text-gray-600 text-sm sm:text-base">
                                    {product.quantity}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-4">No order history</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Cart */}
          {cart.products.length > 0 ? (
            <div className="w-full lg:w-[38%] h-auto lg:h-[100vh] py-[15px] mt-4 lg:mt-0">
              <div
                ref={fixedRef}
                className={`${isFixed && typeof window !== "undefined" && window.innerWidth >= 1024 ? "fixed w-[30%]" : "static w-full"} py-[10px] px-[15px] sm:px-[20px] rounded-[15px] ring-[0.5px] bg-gray-300 h-auto lg:h-[80%]`}
              >
                <p className="text-lg sm:text-[20px] text-gray-700">Shopping Cart</p>
                <div className="h-[0.5px] w-full mt-[10px] bg-black"></div>
                <div className="flex flex-col my-[10px] space-y-1">
                  <div className="flex flex-row justify-between text-sm sm:text-base">
                    <p>Sub total</p>
                    <p>Rs. {cart.totalAmount}</p>
                  </div>
                  <div className="flex flex-row justify-between text-sm sm:text-base">
                    <p>Delivery Charge</p>
                    <p>Rs. 500</p>
                  </div>
                </div>
                <div>
                  <div className="flex flex-row justify-between text-lg sm:text-[20px] mt-[10px]">
                    <p>Grand total</p>
                    <p>Rs. {cart.totalAmount}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-[10px] mt-[20px]">
                  <div
                    onClick={handleCheckout}
                    className="bg-gray-500 rounded-[10px] py-3 sm:py-[10px] cursor-pointer flex items-center justify-center hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-white text-sm sm:text-base">Checkout</p>
                  </div>
                  <div
                    onClick={() => router.push("/")}
                    className="bg-yellow-600 rounded-[10px] py-3 sm:py-[10px] cursor-pointer flex items-center justify-center hover:bg-yellow-700 transition-colors"
                  >
                    <p className="text-white text-sm sm:text-base">Continue Shopping</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full lg:w-[36%] bg-gray-300 flex flex-col items-center justify-center h-[50vh] lg:h-[100vh] my-[10px] rounded-[10px] ring-gray-800 ring-[0.5px] px-[20px] py-[15px]">
              <Image
                src={EmptyCart}
                width={150}
                height={150}
                sizes="(max-width: 640px) 150px, 200px"
                alt="Empty Cart"
                className="rounded-[10px] mt-[10px]"
              />
              <p className="text-xl sm:text-[25px] mt-[10px] text-center">Your cart is empty</p>
            </div>
          )}
        </div>
      </div>
      <div ref={targetRef} className="flex items-center justify-center">
        <div className="w-[95%]">{/* <YouMightLike /> */}</div>
      </div>
      <Max />
      <Footer />
    </div>
  );
};

export default OrderHistory;
