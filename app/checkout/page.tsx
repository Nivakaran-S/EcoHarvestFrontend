"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

// Base URL for API
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// ==== Types ====
interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
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

const CheckoutPage: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart>({ products: [], totalAmount: 0 });
  const [productsDetail, setProductsDetail] = useState<Product[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [advertisement, setAdvertisement] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");

  const router = useRouter();

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
          try {
            const cartResponse = await axios.get<CartResponse>(`${BASE_URL}/cart/${authResponse.data.id}`);
            setCart(cartResponse.data.cart);
            setProductsDetail(cartResponse.data.products);
            setNumberOfCartItems(cartResponse.data.cart.products.length);
          } catch (err) {
            console.error("Error fetching cart:", err);
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

  // Handle checkout
  const handleCheckout = async (): Promise<void> => {
    try {
      const response = await axios.post(
        `${BASE_URL}/orders/checkout`,
        { cart, paymentMethod },
        { withCredentials: true }
      );
      if (response.status === 200) {
        router.push("/order-confirmation");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

      <main className="flex-grow pt-23 ">
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            {cart.products.length > 0 ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <section>
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    {cart.products.map(item => {
                      const product = productsDetail.find(p => p._id === item.productId);
                      return product ? (
                        <div
                          key={item._id}
                          className="flex rounded-[10px] items-center justify-between ring-[0.5px] ring-gray-500 pb-2"
                        >
                          <div className="flex p-2 items-center space-x-4">
                            <Image
                              width={50}
                              height={50}
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-15 h-12 object-cover rounded"
                            />
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.subtitle}</p>
                            </div>
                          </div>
                          <div className="text-right pr-[20px] flex flex-col pt-[1px] justify-center">
                            <p>Rs. {(product.unitPrice * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </section>

                {/* Payment Information */}
                <section>
                  <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                      <span>Cash on Delivery</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        value="Card"
                        checked={paymentMethod === "Card"}
                        onChange={() => setPaymentMethod("Card")}
                      />
                      <span>Visa / MasterCard</span>
                    </label>

                    {paymentMethod === "Card" && (
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Card Number"
                          className="w-full border p-2 rounded"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-1/2 border p-2 rounded"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            className="w-1/2 border p-2 rounded"
                          />
                        </div>
                      </div>
                    )}

                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        value="QR"
                        checked={paymentMethod === "QR"}
                        onChange={() => setPaymentMethod("QR")}
                      />
                      <span>QR Code Payment</span>
                    </label>

                    {paymentMethod === "QR" && (
                      <div className="flex justify-center mt-4">
                        <Image
                          src="/qr-placeholder.png"
                          alt="QR Code"
                          width={150}
                          height={150}
                          className="border p-2 rounded"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Order Total */}
                <section className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>Rs. {cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>Rs. 500.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>Rs. {(cart.totalAmount + 500).toFixed(2)}</span>
                  </div>
                </section>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
                >
                  Complete Purchase
                </button>
              </div>
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
      </main>

      <Max />
      <Footer />
    </div>
  );
};

export default CheckoutPage;
