"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";

// Base URL for API
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// ==== Types ====
interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  subtitle: string;
  averageRating: number;
  imageUrl: string;
  MRP: number;
  quantity: number;
  unitPrice: number;
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

interface CartResponse {
  cart: Cart;
  products: Product[];
}

interface AppliedCoupon {
  code: string;
  discount: number;
}

const CheckoutPage: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart>({ _id: "", products: [], totalAmount: 0 });
  const [productsDetail, setProductsDetail] = useState<Product[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [advertisement, setAdvertisement] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash_on_delivery");
  
  // Applied coupon from cart page
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  
  // Payment details for card
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: ""
  });

  const router = useRouter();

  // Calculate amounts
  const discount = appliedCoupon?.discount || 0;
  const deliveryFee = cart.totalAmount >= 5000 ? 0 : 250;
  const tax = ((cart.totalAmount - discount) * 0.05);
  const finalTotal = cart.totalAmount - discount + tax + deliveryFee;

  // Fetch advertisement
  useEffect(() => {
    const fetchAdvertisement = async (): Promise<void> => {
      try {
        const response = await axios.get<Advertisement[]>(`${BASE_URL}/advertisement/`);
        setAdvertisement(response.data);
      } catch (error) {
        console.error("Error fetching advertisement:", error);
      }
    };

    fetchAdvertisement();
  }, []);

  // Fetch user data + cart
  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      setLoading(true);
      try {
        const authResponse = await axios.get<UserData>(`${BASE_URL}/check-cookie/`, { withCredentials: true });

        setId(authResponse.data.id);
        setRole(authResponse.data.role);

        if (authResponse.data.role === "Customer") {
          setUserLoggedIn(true);
          
          // Get cart data from sessionStorage or fetch from server
          const storedCart = sessionStorage.getItem('checkoutCart');
          const storedProducts = sessionStorage.getItem('checkoutProducts');
          const storedCoupon = sessionStorage.getItem('appliedCoupon');
          
          if (storedCart && storedProducts) {
            setCart(JSON.parse(storedCart));
            setProductsDetail(JSON.parse(storedProducts));
            setNumberOfCartItems(JSON.parse(storedCart).products.length);
            
            if (storedCoupon) {
              setAppliedCoupon(JSON.parse(storedCoupon));
            }
          } else {
            // Fetch from server if not in sessionStorage
            try {
              const cartResponse = await axios.get<CartResponse>(`${BASE_URL}/cart/${authResponse.data.id}`);
              setCart(cartResponse.data.cart);
              setProductsDetail(cartResponse.data.products);
              setNumberOfCartItems(cartResponse.data.cart.products.length);
            } catch (err) {
              console.error("Error fetching cart:", err);
              toast.error("Failed to load cart");
              router.push("/cart");
            }
          }
        } else if (authResponse.data.role === "Vendor") {
          router.push("/vendor");
        } else if (authResponse.data.role === "Admin") {
          router.push("/admin");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Handle checkout and payment
  const handleCheckout = async (): Promise<void> => {
    if (processing) return;

    // Validate card details if card payment is selected
    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || !cardDetails.cardHolderName || 
          !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error("Please fill in all card details");
        return;
      }
      
      // Basic validation
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error("Invalid card number");
        return;
      }
      
      if (cardDetails.cvv.length !== 3) {
        toast.error("Invalid CVV");
        return;
      }
    }

    setProcessing(true);
    
    try {
      // Step 1: Create order
      const orderResponse = await axios.post(
        `${BASE_URL}/orders/checkout`,
        { cart },
        { withCredentials: true }
      );

      if (orderResponse.status === 200 && orderResponse.data) {
        const orderId = orderResponse.data._id;
        
        // Step 2: Initiate payment
        const paymentResponse = await axios.post(
          `${BASE_URL}/payments/initiate`,
          {
            orderId: orderId,
            userId: id,
            paymentMethod: paymentMethod,
            couponCode: appliedCoupon?.code || null
          },
          { withCredentials: true }
        );

        if (paymentResponse.data.success) {
          const paymentId = paymentResponse.data.data._id;
          
          // Step 3: Process payment
          let paymentDetails: any = {
            paymentMethod: paymentMethod
          };

          if (paymentMethod === "card") {
            paymentDetails = {
              ...paymentDetails,
              cardNumber: cardDetails.cardNumber,
              cardHolderName: cardDetails.cardHolderName,
              expiryDate: cardDetails.expiryDate,
              cvv: cardDetails.cvv,
              cardLastFour: cardDetails.cardNumber.slice(-4),
              cardType: cardDetails.cardNumber.startsWith('4') ? 'Visa' : 'MasterCard'
            };
          } else if (paymentMethod === "bank_transfer") {
            paymentDetails.bankName = "Commercial Bank";
            paymentDetails.accountNumber = "XXXX1234";
          }

          const processResponse = await axios.post(
            `${BASE_URL}/payments/process/${paymentId}`,
            paymentDetails,
            { withCredentials: true }
          );

          if (processResponse.data.success && processResponse.data.data.status === 'completed') {
            // Step 4: Create receipt
            const receiptResponse = await axios.post(
              `${BASE_URL}/receipts`,
              { paymentId: paymentId },
              { withCredentials: true }
            );

            if (receiptResponse.data.success) {
              toast.success("Payment successful!");
              
              // Clear cart data from sessionStorage
              sessionStorage.removeItem('checkoutCart');
              sessionStorage.removeItem('checkoutProducts');
              sessionStorage.removeItem('appliedCoupon');
              
              // Redirect to payment success page with receipt ID
              router.push(`/payment-success?receiptId=${receiptResponse.data.data._id}`);
            } else {
              toast.warning("Payment successful but receipt generation failed");
              router.push("/orders");
            }
          } else {
            toast.error(processResponse.data.data.failedReason || "Payment failed. Please try again.");
            setProcessing(false);
          }
        } else {
          toast.error("Failed to initiate payment");
          setProcessing(false);
        }
      } else {
        toast.error("Failed to create order");
        setProcessing(false);
      }
    } catch (error: any) {
      console.error("Checkout failed:", error);
      const errorMessage = error.response?.data?.message || "Checkout failed. Please try again.";
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center text-black">
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />

      <main className="flex-grow pt-28 w-full">
        <div className="container mx-auto px-4 py-8">
          {/* Advertisement Banner */}
          {advertisement.length > 0 && (
            <div className="bg-gray-100 px-[20px] ring-[1px] ring-gray-500 rounded-[15px] p-6 mb-8 flex flex-row items-center">
              <div className="md:w-2/3 mb-4 md:mb-0">
                <h2 className="text-[30px] font-bold mb-2">{advertisement[0].title}</h2>
                <p className="text-gray-600">{advertisement[0].description}</p>
              </div>
              <div className="md:w-1/4 flex justify-center">
                <Image
                  src={advertisement[0].imageUrl}
                  alt="Advertisement"
                  width={200}
                  height={200}
                  className="rounded-lg max-h-40"
                />
              </div>
            </div>
          )}

          {/* Checkout Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section - Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold mb-6">Checkout</h1>

                {cart.products.length > 0 ? (
                  <>
                    {/* Order Summary */}
                    <section className="mb-6">
                      <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                      <div className="space-y-3">
                        {cart.products.map(item => {
                          const product = productsDetail.find(p => p._id === item.productId);
                          return product ? (
                            <div
                              key={item._id}
                              className="flex rounded-[10px] items-center justify-between ring-[0.5px] ring-gray-500 p-4"
                            >
                              <div className="flex items-center space-x-4">
                                <Image
                                  width={60}
                                  height={60}
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-15 h-15 object-cover rounded"
                                />
                                <div>
                                  <h3 className="font-medium">{product.name}</h3>
                                  <p className="text-sm text-gray-500">{product.subtitle}</p>
                                  <p className="text-sm text-gray-600">Rs. {product.unitPrice} × {item.quantity}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">Rs. {(product.unitPrice * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </section>

                    {/* Payment Method Selection */}
                    <section>
                      <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition">
                          <input
                            type="radio"
                            name="payment"
                            value="cash_on_delivery"
                            checked={paymentMethod === "cash_on_delivery"}
                            onChange={() => setPaymentMethod("cash_on_delivery")}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="font-medium">Cash on Delivery</span>
                            <p className="text-sm text-gray-500">Pay when you receive your order</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition">
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={() => setPaymentMethod("card")}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="font-medium">Credit / Debit Card</span>
                            <p className="text-sm text-gray-500">Visa, MasterCard accepted</p>
                          </div>
                        </label>

                        {paymentMethod === "card" && (
                          <div className="mt-4 p-4 bg-white rounded-lg space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Card Number</label>
                              <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                value={cardDetails.cardNumber}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\s/g, '');
                                  const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                  setCardDetails({...cardDetails, cardNumber: formatted});
                                }}
                                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                              <input
                                type="text"
                                placeholder="John Doe"
                                value={cardDetails.cardHolderName}
                                onChange={(e) => setCardDetails({...cardDetails, cardHolderName: e.target.value})}
                                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  value={cardDetails.expiryDate}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');
                                    if (value.length >= 2) {
                                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                    }
                                    setCardDetails({...cardDetails, expiryDate: value});
                                  }}
                                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">CVV</label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  maxLength={3}
                                  value={cardDetails.cvv}
                                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition">
                          <input
                            type="radio"
                            name="payment"
                            value="bank_transfer"
                            checked={paymentMethod === "bank_transfer"}
                            onChange={() => setPaymentMethod("bank_transfer")}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="font-medium">Bank Transfer</span>
                            <p className="text-sm text-gray-500">Direct bank transfer</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition">
                          <input
                            type="radio"
                            name="payment"
                            value="qr_code"
                            checked={paymentMethod === "qr_code"}
                            onChange={() => setPaymentMethod("qr_code")}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="font-medium">QR Code Payment</span>
                            <p className="text-sm text-gray-500">Scan and pay</p>
                          </div>
                        </label>
                      </div>
                    </section>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
                    <button
                      onClick={() => router.push("/")}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>Rs. {cart.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>- Rs. {discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (5%):</span>
                    <span>Rs. {tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery:</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600">Free delivery on orders over Rs. 5000</p>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>Rs. {finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                {cart.products.length > 0 && (
                  <button
                    onClick={handleCheckout}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Complete Purchase'
                    )}
                  </button>
                )}

                <p className="text-xs text-gray-500 text-center mt-4">
                  Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Max />
      <Footer />
    </div>
  );
};

export default CheckoutPage;