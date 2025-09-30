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
import Loading from "../components/Loading";

// Base URL for API
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// Interfaces
interface CartItem {
  _id: string;
  id: string;
  productId: string;
  quantity: number;
  price: number;
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

interface CouponValidationResponse {
  success: boolean;
  message?: string;
  data?: {
    discountAmount: number;
    finalAmount: number;
    coupon: any;
  };
}

const CartPage: React.FC = () => {
  const [isFixed, setIsFixed] = useState<boolean>(true);
  const targetRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);

  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart>({ _id: "", products: [], totalAmount: 0 });
  const [productsDetail, setProductsDetail] = useState<ProductDetail[]>([]);
  const [updateBtnVisible, setUpdateBtnVisible] = useState<boolean>(false);
  const [advertisement, setAdvertisement] = useState<Advertisement[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);

  const router = useRouter();

  // Calculate delivery fee based on order amount
  const deliveryFee = cart.totalAmount >= 5000 ? 0 : 250;

  // Calculate tax (5%)
  const tax = ((cart.totalAmount - discount) * 0.05);

  // Calculate final total
  const finalTotal = cart.totalAmount - discount + tax + deliveryFee;

  // Fetch advertisements
  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const response = await axios.get<Advertisement[]>(`${BASE_URL}/advertisement/`);
        setAdvertisement(response.data);
      } catch (error) {
        console.error("Error fetching advertisement:", error);
      }
    };
    fetchAdvertisement();
  }, []);

  // Check cookie and fetch cart
  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get<UserData>(`${BASE_URL}/check-cookie/`, { withCredentials: true });
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
            router.push("/");
          }
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchCookies();
  }, [router]);

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await axios.post<CouponValidationResponse>(
        `${BASE_URL}/coupons/validate`,
        {
          code: couponCode,
          orderAmount: cart.totalAmount,
          products: cart.products
        },
        { withCredentials: true }
      );

      if (response.data.success && response.data.data) {
        setAppliedCoupon(response.data.data.coupon);
        setDiscount(response.data.data.discountAmount);
        toast.success(`Coupon applied! You saved Rs. ${response.data.data.discountAmount.toFixed(2)}`);
      } else {
        toast.error(response.data.message || "Invalid coupon code");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to apply coupon";
      toast.error(errorMessage);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // Checkout
  const handleCheckout = async () => {
    if (userLoggedIn) {
      try {
        // Store cart data and coupon in sessionStorage for checkout page
        sessionStorage.setItem('checkoutCart', JSON.stringify(cart));
        sessionStorage.setItem('checkoutProducts', JSON.stringify(productsDetail));
        if (appliedCoupon) {
          sessionStorage.setItem('appliedCoupon', JSON.stringify({
            code: appliedCoupon.code,
            discount: discount
          }));
        } else {
          sessionStorage.removeItem('appliedCoupon');
        }
        router.push("/checkout");
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to proceed to checkout");
      }
    } else {
      router.push("/login");
    }
  };

  // Update cart quantity
  const handleUpdateCart = async (cartId: string, productId: string, quantity: number) => {
    try {
      await axios.post(`${BASE_URL}/cart/update/`, {
        cartId,
        productId,
        updatedQuantity: quantity,
      });
      setUpdateBtnVisible(false);
      
      // Refresh cart data
      const cartResponse = await axios.get<{ cart: Cart; products: ProductDetail[] }>(
        `${BASE_URL}/cart/${id}`
      );
      setCart(cartResponse.data.cart);
      setProductsDetail(cartResponse.data.products);
      
      toast.success("Cart updated successfully");
      
      // Re-validate coupon if applied
      if (appliedCoupon) {
        handleApplyCoupon();
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      toast.error("Failed to update cart");
    }
  };

  // Delete product
  const handleDeleteProduct = async (cartId: string, productId: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/cart/delete/`, {
        cartId,
        productId
      });

      if (response.status === 200) {
        setCart((prevCart) => {
          const newProducts = prevCart.products.filter((p) => p.productId !== productId);
          if (newProducts.length === 0) {
            router.push("/");
            return prevCart;
          }
          const newTotal = newProducts.reduce((total, item) => {
            const product = productsDetail.find((p) => p._id === item.productId);
            return total + (product ? product.unitPrice * item.quantity : 0);
          }, 0);
          return {
            ...prevCart,
            products: newProducts,
            totalAmount: newTotal,
          };
        });
        toast.success("Product removed from cart");
        
        // Re-validate coupon if applied
        if (appliedCoupon) {
          setTimeout(() => handleApplyCoupon(), 500);
        }
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      toast.error("Failed to remove product. Please try again.");
    }
  };

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
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

  // Quantity helpers
  const handleIncreaseQuantity = (itemId: string) => updateQuantityInternal(itemId, 1);
  const handleDecreaseQuantity = (itemId: string) => updateQuantityInternal(itemId, -1);

  const updateQuantityInternal = (itemId: string, change: number) => {
    setCart((prevCart) => {
      const updatedProducts = prevCart.products.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      );
      const updatedTotal = updatedProducts.reduce((total, item) => {
        const product = productsDetail.find((p) => p._id === item.productId);
        return total + (product ? product.unitPrice * item.quantity : 0);
      }, 0);
      return { ...prevCart, products: updatedProducts, totalAmount: updatedTotal };
    });
    setUpdateBtnVisible(true);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCart((prev) => {
      const updatedProducts = prev.products.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      const updatedTotal = updatedProducts.reduce((total, item) => {
        const product = productsDetail.find((p) => p._id === item.productId);
        return total + (product ? product.unitPrice * item.quantity : 0);
      }, 0);
      return { ...prev, products: updatedProducts, totalAmount: updatedTotal };
    });
  };

  if (loading) {
    return <Loading />;
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

      <div className="pt-[18vh] bg-white w-full flex items-center justify-center text-black">
        <div className="w-[90%] min-h-[100vh] flex flex-row">
          {/* Left Section */}
          <div className="w-[76.4%] pr-[20px]">
            {/* Advertisement */}
            {advertisement.length > 0 && (
              <div className="w-full flex flex-row h-[200px] bg-gray-300 rounded-[10px] mt-[10px] ring-[0.5px] ring-gray-800">
                <div className="w-[60%] flex flex-col items-center justify-center">
                  <div className="w-[80%]">
                    <p className="text-[25px] leading-[30px]">{advertisement[0]?.title}</p>
                    <p className="text-gray-600 leading-[20px] mt-[5px]">{advertisement[0]?.description}</p>
                  </div>
                </div>
                <div className="w-[40%] flex items-center justify-center">
                  <Image
                    src={advertisement[0]?.imageUrl || ProductImage}
                    width={220}
                    height={150}
                    alt="Advertisement"
                    className="rounded-[10px]"
                  />
                </div>
              </div>
            )}

            {/* Shopping Cart */}
            <p className="text-[35px] px-[20px] mt-[10px] mb-[5px]">Shopping Cart</p>
            <div className="w-full mt-[10px] mb-[20px]">
              <div className="flex flex-col space-y-[8px] w-full bg-gray-300 rounded-[10px] px-[10px] py-[9px] ring-[0.5px] ring-gray-500">
                {cart.products.length > 0 ? (
                  cart.products.map((item) => {
                    const product = productsDetail.find((p) => p._id === item.productId);
                    if (!product) return null;
                    return (
                      <div
                        key={item._id}
                        className="w-full h-[120px] pl-[5px] pr-[20px] py-[4.5px] bg-white rounded-[8px] ring-gray-500 ring-[0.5px] flex flex-row justify-between"
                      >
                        <div className="flex flex-row space-x-[10px]">
                          <div className="bg-gray-200 w-[110px] flex items-center justify-center h-[110px] rounded-[6px]">
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
                                <div className="w-full flex items-center justify-center">
                                  <input
                                    value={item.quantity}
                                    onChange={(e) => {
                                      setUpdateBtnVisible(true);
                                      updateQuantity(item.id, Math.max(1, Number(e.target.value) || 1));
                                    }}
                                    className="w-full text-[20px] text-center focus:outline-none"
                                  />
                                </div>
                                <div onClick={() => handleIncreaseQuantity(item.id)} className="px-[10px] cursor-pointer">
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
                          <p className="text-[23px] py-[8px]">Rs. {(product.unitPrice * item.quantity).toFixed(2)}</p>
                          <div className="flex flex-col leading-[22px]">
                            <div
                              onClick={() => handleDeleteProduct(cart._id, product._id)}
                              className="cursor-pointer w-fit"
                            >
                              <p className="text-red-600">Delete</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-8 text-gray-600">No products in the cart</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="w-[38%] h-[100vh] py-[15px]">
            <div
              ref={fixedRef}
              className={`${isFixed ? "fixed w-[30%]" : "static w-[100%]"} py-[10px] px-[20px] rounded-[15px] ring-[0.5px] bg-gray-300`}
            >
              <p className="text-[20px] text-gray-700">Order Summary</p>
              <div className="h-[0.5px] w-full mt-[10px] bg-black"></div>
              
              <div className="flex flex-col my-[10px] space-y-2">
                <div className="flex flex-row justify-between">
                  <p>Subtotal</p>
                  <p>Rs. {cart.totalAmount.toFixed(2)}</p>
                </div>
                
                {discount > 0 && (
                  <div className="flex flex-row justify-between text-green-600">
                    <p>Discount ({appliedCoupon?.code})</p>
                    <p>- Rs. {discount.toFixed(2)}</p>
                  </div>
                )}
                
                <div className="flex flex-row justify-between">
                  <p>Tax (5%)</p>
                  <p>Rs. {tax.toFixed(2)}</p>
                </div>
                
                <div className="flex flex-row justify-between">
                  <p>Delivery Charge</p>
                  <p>{deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toFixed(2)}`}</p>
                </div>
                {deliveryFee === 0 && (
                  <p className="text-xs text-green-600">Free delivery on orders over Rs. 5000</p>
                )}
              </div>
              
              <div className="h-[0.5px] w-full bg-black"></div>
              
              {/* Coupon Section */}
              <div className="my-[18px]">
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-green-800">Coupon Applied!</p>
                        <p className="text-xs text-green-600">{appliedCoupon.code}</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row gap-2">
                    <input
                      className="border-[0.5px] flex-1 rounded-[5px] px-[10px] py-2 focus:outline-none uppercase"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={validatingCoupon}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 rounded-[5px] py-[5px] px-[15px] text-[15px] cursor-pointer flex items-center justify-center text-white transition-colors"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="h-[0.5px] w-full bg-black"></div>
              
              <div className="flex flex-row justify-between text-[20px] mt-[10px]">
                <p>Grand Total</p>
                <p>Rs. {finalTotal.toFixed(2)}</p>
              </div>
              
              <div className="flex flex-col space-y-[10px] mt-[20px]">
                <div
                  onClick={handleCheckout}
                  className="bg-gray-500 hover:bg-gray-600 rounded-[10px] py-[10px] cursor-pointer flex items-center justify-center transition-colors"
                >
                  <p>Proceed to Checkout</p>
                </div>
                <div
                  onClick={() => router.push("/")}
                  className="bg-yellow-600 hover:bg-yellow-700 rounded-[10px] py-[10px] cursor-pointer flex items-center justify-center transition-colors"
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