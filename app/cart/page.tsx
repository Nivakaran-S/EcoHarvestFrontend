"use client";

import Footer from "../components/Footer";
import Max from "../components/Max";
import Navigation from "../components/Navigation";
import Image from "next/image";
import ProductImage from "../images/product.png";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

// Base URL for API
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// Define interfaces
interface CartItem {
  _id: string;
  id: string;
  productId: string;
  quantity: number;
}

interface ProductDetail {
  _id: string;
  name: string;
  unitPrice: number;
  status: string;
  imageUrl: string;
  subtitle: string;
}

interface Cart {
  _id: string;
  products: CartItem[];
  totalAmount: number;
}

interface Advertisement {
  title: string;
  description: string;
  imageUrl: string;
}

interface UserData {
  id: string;
  role: string;
}

const CartPage: React.FC = () => {
  const [isFixed, setIsFixed] = useState<boolean>(true);
  const targetRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);

  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart>({
    _id: "",
    products: [],
    totalAmount: 0
  });
  const [productsDetail, setProductsDetail] = useState<ProductDetail[]>([]);
  const [updateBtnVisible, setUpdateBtnVisible] = useState<boolean>(false);
  const [advertisement, setAdvertisement] = useState<Advertisement[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);

  const router = useRouter();

  // Fetch advertisements
  useEffect(() => {
    const fetchAdvertisement = async (): Promise<void> => {
      try {
        const response = await axios.get<Advertisement[]>(`${BASE_URL}/advertisement/`);
        setAdvertisement(response.data);
      } catch (error) {
        console.error('Error fetching advertisement:', error);
      }
    };
    fetchAdvertisement();
  }, []);

  // Check cookie and fetch cart
  useEffect(() => {
    const fetchCookies = async (): Promise<void> => {
      try {
        const response = await axios.get<UserData>(
          `${BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        setId(response.data.id);
        setRole(response.data.role);

        if (response.data.role === "Customer") {
          setUserLoggedIn(true);
          try {
            const cartResponse = await axios.get<{ cart: Cart; products: ProductDetail[] }>(
              `${BASE_URL}/cart/${response.data.id}`
            );
            setCart(cartResponse.data.cart);
            setProductsDetail(cartResponse.data.products);
            setNumberOfCartItems(cartResponse.data.cart.products.length);
          } catch (err) {
            setUserLoggedIn(false);
            router.push('/');
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

  // Checkout
  const handleCheckout = async (): Promise<void> => {
    if (userLoggedIn) {
      try {
        await axios.post(`${BASE_URL}/orders/checkout`, { cart });
        router.push("/checkout");
      } catch (error) {
        console.error("Checkout error:", error);
      }
    } else {
      router.push("/login");
    }
  };

  // Update cart quantity
  const handleUpdateCart = async (cartId: string, productId: string, quantity: number): Promise<void> => {
    try {
      await axios.post(`${BASE_URL}/cart/update/`, {
        cartId,
        productId,
        updatedQuantity: String(quantity),
      });
      setUpdateBtnVisible(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  // Delete a product from cart
  const handleDeleteProduct = async (cartId: string, productId: string): Promise<void> => {
    try {
      const response = await axios.delete(`${BASE_URL}/cart/delete/`, {
        data: { cartId, productId }
      });

      if (response.status === 200) {
        setCart(prevCart => {
          const newProducts = prevCart.products.filter(p => p.productId !== productId);
          if (newProducts.length === 0) router.push('/');
          return { 
            ...prevCart, 
            products: newProducts,
            totalAmount: newProducts.reduce((total, item) => {
              const product = productsDetail.find(p => p._id === item.productId);
              return total + (product ? product.unitPrice * item.quantity : 0);
            }, 0)
          };
        });
        toast.success("Product removed from cart");
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      toast.error("Failed to remove product. Please try again.");
    }
  };

  // Scroll handler for fixed order summary
  useEffect(() => {
    const handleScroll = (): void => {
      if (fixedRef.current && targetRef.current) {
        const fixedHeight = fixedRef.current.clientHeight;
        const targetTop = targetRef.current.getBoundingClientRect().top;
        setIsFixed(targetTop > fixedHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Increase/decrease quantity
  const handleIncreaseQuantity = (itemId: string): void => {
    updateQuantityInternal(itemId, 1);
  };

  const handleDecreaseQuantity = (itemId: string): void => {
    updateQuantityInternal(itemId, -1);
  };

  const updateQuantityInternal = (itemId: string, change: number): void => {
    setCart(prevCart => {
      const updatedProducts = prevCart.products.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );

      const updatedTotal = updatedProducts.reduce((total, item) => {
        const product = productsDetail.find(p => p._id === item.productId);
        return total + (product ? product.unitPrice * item.quantity : 0);
      }, 0);

      return { ...prevCart, products: updatedProducts, totalAmount: updatedTotal };
    });
    setUpdateBtnVisible(true);
  };

  const updateQuantity = (itemId: string, newQuantity: number): void => {
    setCart(prev => {
      const updatedProducts = prev.products.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      const updatedTotal = updatedProducts.reduce((total, item) => {
        const product = productsDetail.find(p => p._id === item.productId);
        return total + (product ? product.unitPrice * item.quantity : 0);
      }, 0);
      return { ...prev, products: updatedProducts, totalAmount: updatedTotal };
    });
  };

  // Fetch cart again if user ID changes
  useEffect(() => {
    const fetchCart = async (): Promise<void> => {
      if(!userLoggedIn) return;
      try {
        const response = await axios.get<{ cart: Cart; products: ProductDetail[] }>(`${BASE_URL}/cart/${id}`);
        setCart(response.data.cart);
        setProductsDetail(response.data.products);
        setNumberOfCartItems(response.data.cart.products.length);
      } catch(err) {
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

      <div className="pt-[15vh] w-[100%] flex items-center justify-center text-black">
        <div className="w-[95%] min-h-[100vh] flex flex-row">
          <div className="w-[76.4%] pr-[20px] h-[100%]">
            {/* Advertisement */}
            <div className="w-[100%] flex flex-row h-[200px] bg-gray-300 rounded-[10px] mt-[10px] ring-[0.5px] ring-gray-800">
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

            {/* Shopping Cart */}
            <p className="text-[35px] px-[20px] mt-[10px] mb-[5px]">Shopping Cart</p>
            <div className="w-[100%] mt-[10px] mb-[20px] h-[100%]">
              <div className="flex flex-col space-y-[8px] w-[100%] bg-gray-300 rounded-[10px] px-[10px] py-[9px] ring-[0.5px] ring-gray-500">
                {cart.products.length > 0 ? (
                  cart.products.map((item) => {
                    const product = productsDetail.find(p => p._id === item.productId);
                    return product ? (
                      <div
                        key={item._id}
                        className="w-[100%] h-[120px] pl-[5px] pr-[20px] py-[4.5px] bg-white rounded-[8px] ring-gray-500 ring-[0.5px] flex flex-row justify-between"
                      >
                        <div className="flex flex-row space-x-[10px]">
                          <div className="bg-gray-200 ring-[0px] ring-gray-500 w-[110px] flex items-center justify-center h-[110px] rounded-[6px]">
                            <Image alt="" src={product.imageUrl || ProductImage} height={90} width={90} />
                          </div>
                          <div className="py-[8px] leading-[24px]">
                            <p className="text-[20px] text-gray-800">{product.name}</p>
                            <div className="flex flex-row items-center space-x-[10px] ml-[10px]">
                              <p className="text-[16px] text-gray-600">Rs.{product.unitPrice}</p>
                              <p className="text-gray-600">|</p>
                              <p className="text-green-700">{product.status}</p>
                            </div>
                            <div className="flex flex-row items-center space-x-[10px]">
                              <div className="bg-white ring-[1px] ring-gray-400 h-[30px] mt-[10px] ml-[10px] w-[90px] rounded-[5px] flex flex-row items-center justify-center">
                                <div
                                  onClick={() => handleDecreaseQuantity(item.id)}
                                  className="px-[10px] cursor-pointer h-[100%] flex items-center justify-center"
                                >
                                  <div className="bg-black h-[1px] w-[10px]"></div>
                                </div>
                                <div className="w-[100%] flex items-center justify-center">
                                  <input
                                    value={item.quantity}
                                    onChange={(e) => {
                                      setUpdateBtnVisible(true);
                                      updateQuantity(item.id, Math.max(1, Number(e.target.value) || 1));
                                    }}
                                    className="w-full text-[20px] text-center focus:outline-none"
                                  />
                                </div>
                                <div
                                  onClick={() => handleIncreaseQuantity(item.id)}
                                  className="px-[10px] cursor-pointer"
                                >
                                  <p className="text-[20px]">+</p>
                                </div>
                              </div>
                              {updateBtnVisible && (
                                <div
                                  onClick={() => handleUpdateCart(cart._id, product._id, item.quantity)}
                                  className="bg-gray-400 ring-[0.5px] ring-gray-800 mt-[10px] cursor-pointer px-[20px] rounded-[4px] text-[15px] py-[2px]"
                                >
                                  <p>Update</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[23px] py-[8px]">Rs. {product.unitPrice * item.quantity}</p>
                          <div className="flex flex-col leading-[22px]">
                            <div className="cursor-pointer w-fit"><p>Favourites</p></div>
                            <div
                              onClick={() => handleDeleteProduct(cart._id, product._id)}
                              className="cursor-pointer w-fit"
                            >
                              <p className="text-red-600">Delete</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })
                ) : (
                  <p>No products in the cart</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-[38%] h-[100vh] py-[15px]">
            <div
              ref={fixedRef}
              className={`${isFixed ? "fixed w-[30%]" : "static w-[100%]"} py-[10px] px-[20px] rounded-[15px] ring-[0.5px] bg-gray-300 h-[80%]`}
            >
              <p className="text-[20px] text-gray-700">Order Summary</p>
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
              <div className="h-[0.5px] w-[100%] bg-black"></div>
              <div className="flex flex-row justify-between my-[18px]">
                <input
                  className="border-[0.5px] w-[250px] rounded-[5px] px-[10px] focus:outline-none"
                  placeholder="Enter coupon number"
                />
                <div className="bg-gray-500 rounded-[5px] py-[5px] px-[10px] text-[15px] cursor-pointer flex items-center justify-center">
                  <p>Apply Coupon</p>
                </div>
              </div>
              <div className="h-[0.5px] w-[100%] bg-black"></div>
              <div>
                <div className="flex flex-row justify-between text-[20px] mt-[10px]">
                  <p>Grand total</p>
                  <p>Rs. {cart.totalAmount + 500}</p>
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
                  onClick={() => router.push('/')} 
                  className="bg-yellow-600 rounded-[10px] py-[10px] cursor-pointer flex items-center justify-center"
                >
                  <p>Continue Shopping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={targetRef} className="flex items-center justify-center">
        <div className="w-[95%]">{/* <YouMightLike/> */}</div>
      </div>

      <Max />
      <Footer />
    </div>
  );
};

export default CartPage;
