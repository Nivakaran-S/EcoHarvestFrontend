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

  const router = useRouter();

  // Fetch advertisement
  useEffect(() => {
    const fetchAdvertisement = async (): Promise<void> => {
      try {
        const response = await axios.get<Advertisement[]>(`${API_BASE_URL}/advertisement/`);
        setAdvertisement(response.data);
      } catch (error) {
        console.error("Error fetching advertisement:", error);
      }
    };
    fetchAdvertisement();
  }, []);

  // Check cookie and fetch cart
  useEffect(() => {
    const fetchCookies = async (): Promise<void> => {
      try {
        const response = await axios.get<{ id: string; role: string }>(
          `${API_BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        setId(response.data.id);
        setRole(response.data.role);

        if (response.data.role === "Customer") {
          setUserLoggedIn(true);
          try {
            const response2 = await axios.get<{ cart: Cart; products: Product[] }>(
              `${API_BASE_URL}/cart/${response.data.id}`
            );
            setCart(response2.data.cart);
            setProductsDetail(response2.data.products);
            setNumberOfCartItems(response2.data.cart.products.length);
          } catch (err) {
            console.log("Cart Empty");
          }
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch (error) {
        router.push("/login");
      }
    };
    fetchCookies();
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

  // Fetch order history
  useEffect(() => {
    const fetchOrderHistory = async (): Promise<void> => {
      if (!userLoggedIn) return;
      try {
        const response = await axios.get<Order[]>(`${API_BASE_URL}/orders/history/${id}`);
        setOrderHistory(response.data);
      } catch (err) {
        console.log("No order history");
      }
    };
    fetchOrderHistory();
  }, [id, userLoggedIn]);

  // Fetch cart again
  useEffect(() => {
    const fetchCart = async (): Promise<void> => {
      if (!userLoggedIn) return;
      try {
        const response = await axios.get<{ cart: Cart; products: Product[] }>(
          `${API_BASE_URL}/cart/${id}`
        );
        setCart(response.data.cart);
        setProductsDetail(response.data.products);
        setNumberOfCartItems(response.data.cart.products.length);
      } catch (err) {
        console.log("Cart Empty");
      }
    };
    fetchCart();
  }, [id, userLoggedIn]);

  return (
    <div>
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />
      <div className="pt-[15vh] bg-white w-[100%] flex items-center justify-center text-black">
        <div className="w-[95%] min-h-[100vh] flex flex-row ">
          <div className="w-[76.4%] pr-[20px] h-[100%]">
            <div className="w-[100%] flex flex-row h-[200px] bg-gray-300 rounded-[10px] mt-[10px] ring-[0.5px] ring-gray-800 ">
              <div className="w-[60%] h-[100%] flex flex-col items-center justify-center">
                <div className="w-[80%]">
                  <p className="text-[25px] leading-[30px]">{advertisement[0]?.title}</p>
                  <p className="text-gray-600 leading-[20px] mt-[5px]">{advertisement[0]?.description}</p>
                </div>
              </div>
              <div className="w-[40%] h-[100%] flex items-center justify-center">
                <Image
                  src={advertisement[0]?.imageUrl || ProductImage}
                  width={220}
                  height={150}
                  alt="Advertisement"
                  className="rounded-[10px]"
                />
              </div>
            </div>
            <p className="text-[35px] px-[20px] mt-[10px] mb-[5px] ">Order History</p>
            <div className="w-[100%] mt-[10px] mb-[20px] h-[100%]">
              <div className="flex flex-col space-y-[8px] w-[100%] bg-gray-300 rounded-[10px] px-[10px] py-[9px] ring-[0.5px] ring-gray-500">
                {orderHistory.length > 0 ? (
                  orderHistory.map((item) => {
                    const dateObj = new Date(item.orderTime);
                    const date = dateObj.toISOString().split("T")[0];
                    const time = dateObj.toTimeString().split(" ")[0];

                    return (
                      <div
                        key={item._id}
                        className="w-[100%] min-h-[220px] pl-[5px] pr-[20px] py-[10px] bg-white rounded-[8px] ring-gray-500 ring-[0.5px] flex flex-col justify-between"
                      >
                        <div className="flex flex-row px-[10px] justify-between items-center">
                          <div className="text-[20px]">Order #{item.orderNumber}</div>
                          <div className="bg-gray-300 ring-gray-800 ring-[0.5px] px-[10px] text-[15px] rounded-[3px] w-fit">
                            {item.status}
                          </div>
                        </div>
                        <div className="flex flex-row px-[10px] justify-between">
                          <div>Date: {date}</div>
                          <div>Time: {time}</div>
                        </div>
                        <div className="px-[10px]">Total amount: Rs. {item.totalAmount}</div>
                        <div className="flex flex-col px-[10px] bg-gray-200 py-[10px] mt-[5px] w-[100%] mx-[8px] rounded-[10px] ring-[0.5px] ring-gray-800">
                          {item.products.map((product) => (
                            <div
                              key={product.productId._id}
                              className="flex flex-row my-[5px] ring-gray-500 rounded-[5px] py-[10px] ring-[0.5px] items-center space-x-[10px]"
                            >
                              <Image
                                src={product.productId.imageUrl}
                                width={80}
                                height={80}
                                alt="Product"
                                className="rounded-[10px]"
                              />
                              <div className="flex flex-col w-[350px]">
                                <p className="text-[20px] leading-[20px]">{product.productId.name}</p>
                                <p className="text-gray-600 text-[18px] pl-[10px]">{product.productId.subtitle}</p>
                                <p className="text-gray-600 pl-[10px]">{product.productId.averageRating}</p>
                              </div>
                              <div className="flex flex-col w-[130px]">
                                <p>Total Amount</p>
                                <p className="text-gray-600">Rs. {product.unitPrice * product.quantity}</p>
                              </div>
                              <div className="flex flex-col w-[130px]">
                                <p>M.R.P.</p>
                                <p className="text-gray-600">Rs. {product.productId.MRP}</p>
                              </div>
                              <div className="flex flex-col w-[130px]">
                                <p>Unit Price</p>
                                <p className="text-gray-600">Rs. {product.productId.unitPrice}</p>
                              </div>
                              <div className="flex flex-col w-[130px]">
                                <p>Quantity</p>
                                <p className="text-gray-600">{product.quantity}</p>
                              </div>
                              
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No order history</p>
                )}
              </div>
            </div>
          </div>
          {cart.products.length > 0 ? (
            <div className="w-[38%] h-[100vh] py-[15px]">
              <div
                ref={fixedRef}
                className={`${isFixed ? "fixed w-[30%]" : "static w-[100%]"} py-[10px] px-[20px] rounded-[15px] ring-[0.5px] bg-gray-300 h-[80%]`}
              >
                <p className="text-[20px] text-gray-700">Shopping Cart</p>
                <div className="h-[0.5px] w-[100%] mt-[10px] bg-black"></div>
                <div className="flex flex-col my-[10px]">
                  <div className="flex flex-row justify-between">
                    <p>Sub total</p>
                    <p>Rs. {cart.totalAmount}</p>
                  </div>
                  <div className="flex flex-row justify-between">
                    <p>Delivery Charge</p>
                    <p>Rs. 500</p>
                  </div>
                </div>
                <div>
                  <div className="flex flex-row justify-between text-[20px] mt-[10px]">
                    <p>Grand total</p>
                    <p>Rs. {cart.totalAmount}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-[10px] mt-[20px]">
                  <div
                    onClick={handleCheckout}
                    className="bg-gray-500 rounded-[10px] py-[10px] cursor-pointer flex items-center justify-center"
                  >
                    <p>Checkout</p>
                  </div>
                  <div
                    onClick={() => router.push("/")}
                    className="bg-yellow-600 rounded-[10px] py-[10px] cursor-pointer flex items-center justify-center"
                  >
                    <p>Continue Shopping</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-[36%] bg-gray-300 flex flex-col items-center justify-center h-[100vh] my-[10px] rounded-[10px] ring-gray-800 ring-[0.5px] px-[20px] py-[15px]">
              <Image
                src={EmptyCart}
                width={200}
                height={200}
                alt="Empty Cart"
                className="rounded-[10px] mt-[10px]"
              />
              <p className="text-[25px] mt-[10px]">Your cart is empty</p>
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
