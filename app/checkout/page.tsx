"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

// Base URL for API
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// Define TypeScript interfaces
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

  const router = useRouter();

  // Fetch advertisement data
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

  // Fetch user data and cart
  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Check user authentication
        const authResponse = await axios.get<UserData>(`${BASE_URL}/check-cookie/`, { withCredentials: true });

        setId(authResponse.data.id);
        setRole(authResponse.data.role);

        // Handle different user roles
        if (authResponse.data.role === "Customer") {
          setUserLoggedIn(true);
          try {
            // Fetch cart data for authenticated customer
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

  // Handle checkout process
  const handleCheckout = async (): Promise<void> => {
    try {
      const response = await axios.post(`${BASE_URL}/orders/checkout`, { cart }, { withCredentials: true });
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
    <div className="min-h-screen flex flex-col">
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />

      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Advertisement Banner */}
          {advertisement.length > 0 && (
            <div className="bg-gray-100 rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">{advertisement[0].title}</h2>
                <p className="text-gray-600">{advertisement[0].description}</p>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <img 
                  src={advertisement[0].imageUrl} 
                  alt="Advertisement" 
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
                        <div key={item._id} className="flex items-center justify-between border-b pb-3">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.subtitle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p>${(item.unitPrice * item.quantity).toFixed(2)}</p>
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
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Payment methods will be displayed here</p>
                  </div>
                </section>

                {/* Order Total */}
                <section className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>${cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${(cart.totalAmount + 5).toFixed(2)}</span>
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
