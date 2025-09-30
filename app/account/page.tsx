'use client';

import Image from "next/image";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";

const BASE_URL = "https://eco-harvest-backend.vercel.app";

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

export default function AccountManagement() {
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart>({ products: [], totalAmount: 0 });
  const [productsDetail, setProductsDetail] = useState<Product[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [userInformation, setUserInformation] = useState<UserInformation | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    const fetchData = async () => {
      try {
        const cookieRes = await axios.get<{ id: string; role: string }>(
          `${BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        setId(cookieRes.data.id);
        setRole(cookieRes.data.role);

        const userRes = await axios.get<UserInformation[]>(
          `${BASE_URL}/customers/details/${cookieRes.data.id}`,
          { withCredentials: true }
        );
        setUserInformation(userRes.data[2]);
        setFirstName(userRes.data[2].firstName);
        setLastName(userRes.data[2].lastName);
        setEmail(userRes.data[2].email);
        setPhoneNumber(userRes.data[2].phoneNumber);
        setAddress(userRes.data[2].address);
        setDateOfBirth(userRes.data[2].dateOfBirth);
        setUsername(userRes.data[2].username);

        const notifRes = await axios.get<Notification[]>(
          `${BASE_URL}/notification/${cookieRes.data.id}`,
          { withCredentials: true }
        );
        setNotifications(notifRes.data);

        if (cookieRes.data.role === "Customer") {
          setUserLoggedIn(true);
          try {
            const cartRes = await axios.get<{ cart: Cart; products: Product[] }>(
              `${BASE_URL}/cart/${cookieRes.data.id}`,
              { withCredentials: true }
            );
            setCart(cartRes.data.cart);
            setProductsDetail(cartRes.data.products);
            setNumberOfCartItems(cartRes.data.cart.products.length);
          } catch {
            console.log("Cart Empty");
          }
        } else if (cookieRes.data.role === "Vendor") {
          router.push("/vendor");
        } else if (cookieRes.data.role === "Admin") {
          router.push("/admin");
        }
        setLoading(false);
      } catch {
        router.push("/login");
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!userLoggedIn || !id) return;
      try {
        const cartRes = await axios.get<{ cart: Cart; products: Product[] }>(
          `${BASE_URL}/cart/${id}`,
          { withCredentials: true }
        );
        setCart(cartRes.data.cart);
        setProductsDetail(cartRes.data.products);
        setNumberOfCartItems(cartRes.data.cart.products.length);
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

      <div className="flex items-center justify-center text-gray-900 min-h-screen pt-[12vh] sm:pt-[15vh] pb-8">
        <div className="w-[95%] lg:w-[90%] xl:w-[85%] flex flex-col lg:flex-row gap-6 mt-8">
          {/* Main Profile Section */}
          <div className="w-full lg:w-[70%] space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
                  <p className="text-sm text-gray-500">Manage your account details and preferences</p>
                </div>
              </div>
            </div>

            {/* Profile Info Card */}
            {userInformation && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                {/* User Header */}
                <div className="pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {userInformation.firstName?.charAt(0) || ''}{userInformation.lastName?.charAt(0) || ''}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {userInformation.firstName} {userInformation.lastName}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {userInformation.createdTimestamp ? (
                          <>
                            Member since{" "}
                            {new Date(userInformation.createdTimestamp).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </>
                        ) : (
                          "Member"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-300">
                      {userInformation.type}
                    </span>
                    <span className="px-4 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-300">
                      {userInformation.role}
                    </span>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="mt-6 space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!editProfile}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          editProfile
                            ? "border-green-300 focus:border-green-500 bg-white"
                            : "border-gray-200 bg-gray-50"
                        } outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!editProfile}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          editProfile
                            ? "border-green-300 focus:border-green-500 bg-white"
                            : "border-gray-200 bg-gray-50"
                        } outline-none transition-colors`}
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      disabled={!editProfile}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        editProfile
                          ? "border-green-300 focus:border-green-500 bg-white"
                          : "border-gray-200 bg-gray-50"
                      } outline-none transition-colors`}
                    />
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!editProfile}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          editProfile
                            ? "border-green-300 focus:border-green-500 bg-white"
                            : "border-gray-200 bg-gray-50"
                        } outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={!editProfile}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          editProfile
                            ? "border-green-300 focus:border-green-500 bg-white"
                            : "border-gray-200 bg-gray-50"
                        } outline-none transition-colors`}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!editProfile}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        editProfile
                          ? "border-green-300 focus:border-green-500 bg-white"
                          : "border-gray-200 bg-gray-50"
                      } outline-none transition-colors`}
                    />
                  </div>

                  {/* Credentials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!editProfile}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          editProfile
                            ? "border-green-300 focus:border-green-500 bg-white"
                            : "border-gray-200 bg-gray-50"
                        } outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={!editProfile}
                        placeholder="••••••"
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          editProfile
                            ? "border-green-300 focus:border-green-500 bg-white"
                            : "border-gray-200 bg-gray-50"
                        } outline-none transition-colors`}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-gray-200">
                    {!editProfile ? (
                      <button
                        onClick={() => setEditProfile(true)}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#1A1A1A] cursor-pointer to-[#101010] hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-md"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </span>
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
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
                          className="flex-1 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateProfile}
                          className="flex-1 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-md"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Sidebar */}
          <div className="w-full lg:w-[30%]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              </div>

              {notifications && notifications.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(notification.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(notification.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-center">No notifications yet</p>
                  <p className="text-sm text-gray-400 text-center mt-1">We'll notify you when something arrives</p>
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
}