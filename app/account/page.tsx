'use client';
import Image from "next/image";
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import AllCategories from "../components/AllCategories";
import TopSellers from "../components/TopSellers";
import PopularProducts from "../components/PopularProducts";
import Footer from "../components/Footer";
import YouMightLike from "../components/YouMightLike";
import Max from "../components/Max";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ==== Config ==== 
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// ==== Types ====
interface Product {
  _id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  unitPrice: number;
  rating?: number;
  averageRating?: number;
  category?: string;
  productCategory_id?: string;
  brand?: string;
  MRP?: number;
  numberOfReviews?: number;
}

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface Cart {
  products: CartItem[];
  totalAmount: number;
}

interface UserInformation {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  type: string;
  createdTimestamp: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface ProductDetail {
  _id: string;
  name: string;
  unitPrice: number;
  status: string;
  imageUrl: string;
  subtitle: string;
}

export default function AccountManagement() {
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart>({
      products: [],
      totalAmount: 0
    });
  const [productsDetail, setProductsDetail] = useState<Product[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [userInformation, setUserInformation] = useState<UserInformation | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Profile editing state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ id: string; role: string }>(
          `${BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        setId(response.data.id);
        setRole(response.data.role);

        try {
          const response2 = await axios.get<UserInformation>(
            `${BASE_URL}/customers/details/${response.data.id}`,
            { withCredentials: true }
          );
          setUserInformation(response2.data);
          setFirstName(response2.data.firstName);
          setLastName(response2.data.lastName);
          setEmail(response2.data.email);
          setPhoneNumber(response2.data.phoneNumber);
          setAddress(response2.data.address);
          setDateOfBirth(response2.data.dateOfBirth);
          setUsername(response2.data.username);

          try {
            const response3 = await axios.get<Notification[]>(
              `${BASE_URL}/notification/${response.data.id}`,
              { withCredentials: true }
            );
            setNotifications(response3.data);
          } catch (err) {
            console.error("Error in fetching notifications: ", err);
          }
        } catch (err) {
          console.error("Error in fetching user information: ", err);
        }

        if (response.data.role === "Customer") {
          setUserLoggedIn(true);
          try {
            const response2 = await axios.get<{
              cart: Cart;
              products: Product[];
            }>(`${BASE_URL}/cart/${response.data.id}`, { withCredentials: true });
            setCart(response2.data.cart);
            setProductsDetail(response2.data.products);
            setNumberOfCartItems(response2.data.cart.products.length);
          } catch {
            console.log("Cart Empty");
          }
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCookies();
  }, [router]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!userLoggedIn || !id) return;
      try {
        const response2 = await axios.get<{ cart: Cart; products: Product[] }>(
          `${BASE_URL}/cart/${id}`,
          { withCredentials: true }
        );
        setCart(response2.data.cart);
        setProductsDetail(response2.data.products);
        setNumberOfCartItems(response2.data.cart.products.length);
      } catch {
        console.log("Cart Empty");
      }
    };

    fetchCart();
  }, [id, userLoggedIn]);

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/customers/update`,
        {
          id,
          firstName,
          lastName,
          email,
          phoneNumber,
          address,
          dateOfBirth,
          username,
          password,
        },
        { withCredentials: true }
      );
      console.log("Profile updated successfully:", response.data);
      setUserInformation({
        ...userInformation!,
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        dateOfBirth,
        username,
      });
      setEditProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div>
        <Navigation
          numberOfCartItems={numberOfCartItems}
          productsDetail={productsDetail}
          cart={cart}
          id={id}
          userLoggedIn={userLoggedIn}
        />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Account Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your personal information and stay updated with notifications
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {userInformation && (
                  <div>
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                            {userInformation.firstName[0]}{userInformation.lastName[0]}
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold mb-2">
                              {userInformation.firstName} {userInformation.lastName}
                            </h2>
                            <p className="text-emerald-100 text-sm">
                              Member since {formatDate(userInformation.createdTimestamp)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            {userInformation.type}
                          </span>
                          <span className="bg-orange-400 text-orange-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            {userInformation.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={!editProfile}
                            placeholder={userInformation.firstName}
                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                              editProfile 
                                ? 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white' 
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                        </div>

                        {/* Last Name */}
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={!editProfile}
                            placeholder={userInformation.lastName}
                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                              editProfile 
                                ? 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white' 
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                        </div>

                        {/* Email */}
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!editProfile}
                            placeholder={userInformation.email}
                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                              editProfile 
                                ? 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white' 
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                        </div>

                        {/* Phone Number */}
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={!editProfile}
                            placeholder={userInformation.phoneNumber}
                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                              editProfile 
                                ? 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white' 
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                        </div>

                        {/* Username */}
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={!editProfile}
                            placeholder={userInformation.username}
                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                              editProfile 
                                ? 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white' 
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            disabled={!editProfile}
                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                              editProfile 
                                ? 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white' 
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Address - Full Width */}
                      <div className="mt-6 group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={!editProfile}
                          placeholder={userInformation.address}
                          className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                            editProfile 
                              ? 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white' 
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                        />
                      </div>

                      {/* Password - Only show when editing */}
                      {editProfile && (
                        <div className="mt-6 group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password (optional)
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty to keep current password
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-8 flex justify-end space-x-4">
                        {!editProfile ? (
                          <button
                            onClick={() => setEditProfile(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200"
                          >
                            ✏️ Edit Profile
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditProfile(false);
                                setFirstName(userInformation.firstName);
                                setLastName(userInformation.lastName);
                                setEmail(userInformation.email);
                                setPhoneNumber(userInformation.phoneNumber);
                                setAddress(userInformation.address);
                                setDateOfBirth(userInformation.dateOfBirth);
                                setUsername(userInformation.username);
                                setPassword("");
                              }}
                              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
                            >
                              ❌ Cancel
                            </button>
                            <button
                              onClick={handleUpdateProfile}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200"
                            >
                              ✅ Save Changes
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-fit">
                {/* Notifications Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      🔔
                    </div>
                    <h3 className="text-xl font-bold">Notifications</h3>
                  </div>
                  {notifications.length > 0 && (
                    <div className="mt-2">
                      <span className="bg-white bg-opacity-20 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                        {notifications.length} new
                      </span>
                    </div>
                  )}
                </div>

                {/* Notifications Content */}
                <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications && notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification, index) => (
                        <div
                          key={notification._id}
                          className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                              {notification.title}
                            </h4>
                            <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">
                              New
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-md">
                              📅 {formatDate(notification.createdAt)}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded-md">
                              🕐 {formatTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        🔔
                      </div>
                      <p className="text-gray-500 text-lg font-medium mb-2">No notifications yet</p>
                      <p className="text-gray-400 text-sm">
                        You'll see important updates here when they arrive
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Account Overview
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Cart Items</span>
                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {numberOfCartItems}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Notifications</span>
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Account Type</span>
                    <span className="text-purple-600 text-sm font-semibold">
                      {userInformation?.type || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f9fafb;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      <Max />
      <Footer />
    </div>
  );
}