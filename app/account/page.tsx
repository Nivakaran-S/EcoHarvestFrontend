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
    const fetchData = async () => {
      try {
        const cookieRes = await axios.get<{ id: string; role: string }>(
          `${BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        setId(cookieRes.data.id);
        setRole(cookieRes.data.role);

        const userRes = await axios.get<UserInformation>(
          `${BASE_URL}/customers/details/${cookieRes.data.id}`,
          { withCredentials: true }
        );
        setUserInformation(userRes.data);
        setFirstName(userRes.data.firstName);
        setLastName(userRes.data.lastName);
        setEmail(userRes.data.email);
        setPhoneNumber(userRes.data.phoneNumber);
        setAddress(userRes.data.address);
        setDateOfBirth(userRes.data.dateOfBirth);
        setUsername(userRes.data.username);

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

      <div className="flex flex-col items-center justify-center text-black min-h-screen bg-gray-100">
        <div className="w-[95%] sm:w-[90vw] flex pb-[5vh] flex-col lg:flex-row min-h-[90vh] mt-[15vh] sm:mt-[18vh] space-y-6 lg:space-y-0">
          <div className="w-full lg:w-[70vw] pt-[20px] px-2 sm:px-0">
            <p className="leading-tight sm:leading-[35px] text-2xl sm:text-[30px]">
              Account Management
            </p>
            <p className="text-sm sm:text-base">Manage your account details</p>

            {userInformation && (
              <div className="lg:pr-[30px]">
                <p className="text-2xl sm:text-3xl lg:text-[45px] leading-tight sm:leading-[40px] lg:leading-[50px] mt-4">
                  {userInformation.firstName} {userInformation.lastName}
                </p>
                <p className="text-xs sm:text-[13px] text-gray-500">
                  Member since{" "}
                  {new Date(userInformation.createdTimestamp).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </p>

                <div className="flex flex-row space-x-2 sm:space-x-[20px] w-fit justify-between mt-[5px]">
                  <p className="bg-yellow-500 px-2 sm:px-[20px] py-[2px] rounded-[5px] ring-yellow-800 ring-[0.5px] text-xs sm:text-sm">
                    {userInformation.type}
                  </p>
                  <p className="bg-orange-500 px-2 sm:px-[20px] py-[2px] rounded-[5px] ring-orange-800 ring-[0.5px] text-xs sm:text-sm">
                    {userInformation.role}
                  </p>
                </div>

                {/* === Profile Editing Fields === */}
                <div className="flex flex-col sm:flex-row sm:space-x-[20px] justify-between mt-[20px] space-y-4 sm:space-y-0">
                  <div className="w-full sm:w-[50%]">
                    <p className="text-sm sm:text-base">First name</p>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!editProfile}
                      className="border-2 outline-none border-gray-300 rounded-md p-2 w-full mt-[5px]"
                    />
                  </div>
                  <div className="w-full sm:w-[50%]">
                    <p className="text-sm sm:text-base">Last name</p>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!editProfile}
                      className="border-2 outline-none border-gray-300 rounded-md p-2 w-full mt-[5px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-[20px] justify-between mt-[20px] space-y-4 sm:space-y-0">
                  <div className="w-full sm:w-[50%]">
                    <p className="text-sm sm:text-base">Date of birth</p>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      disabled={!editProfile}
                      className="border-2 outline-none border-gray-300 rounded-md p-2 w-full mt-[5px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-[20px] justify-between mt-[20px] space-y-4 sm:space-y-0">
                  <div className="w-full sm:w-[50%]">
                    <p className="text-sm sm:text-base">Email</p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editProfile}
                      className="border-2 outline-none border-gray-300 rounded-md p-2 w-full mt-[5px]"
                    />
                  </div>
                  <div className="w-full sm:w-[50%]">
                    <p className="text-sm sm:text-base">Phone number</p>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={!editProfile}
                      className="border-2 outline-none border-gray-300 rounded-md p-2 w-full mt-[5px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-[20px] justify-between mt-[20px] space-y-4 sm:space-y-0">
                  <div className="w-full sm:w-[50%]">
                    <p className="text-sm sm:text-base">Address</p>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!editProfile}
                      className="border-2 outline-none border-gray-300 rounded-md p-2 w-full mt-[5px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-[20px] justify-between mt-[20px] space-y-4 sm:space-y-0">
                  <div className="w-full sm:w-[50%]">
                    <p className="text-sm sm:text-base">Username</p>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!editProfile}
                      className="border-2 outline-none border-gray-300 rounded-md p-2 w-full mt-[5px]"
                    />
                  </div>
                  <div className="w-full sm:w-[50%]">
                    <p className="text-sm sm:text-base">Password</p>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!editProfile}
                      placeholder="******"
                      className="border-2 outline-none border-gray-300 rounded-md p-2 w-full mt-[5px]"
                    />
                  </div>
                </div>

                <div>
                  {!editProfile ? (
                    <div className="flex flex-row justify-center sm:justify-end mt-[20px]">
                      <div
                        onClick={() => setEditProfile(true)}
                        className="bg-orange-500 w-full sm:w-fit px-4 py-3 rounded-[5px] ring-orange-800 ring-[0.5px] cursor-pointer text-center hover:bg-orange-600 transition-colors"
                      >
                        <p className="text-sm sm:text-base text-white">Edit Profile</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-[20px] justify-center sm:justify-end mt-[20px]">
                      <div
                        className="bg-gray-500 px-4 py-3 rounded-[5px] ring-gray-800 ring-[0.5px] cursor-pointer text-center hover:bg-gray-600 transition-colors"
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
                      >
                        <p className="text-sm sm:text-base text-white">Cancel</p>
                      </div>
                      <div
                        onClick={handleUpdateProfile}
                        className="bg-orange-500 px-4 py-3 rounded-[5px] ring-orange-800 ring-[0.5px] cursor-pointer text-center hover:bg-orange-600 transition-colors"
                      >
                        <p className="text-sm sm:text-base text-white">Confirm</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Section */}
          <div className="w-full lg:w-[30vw] h-auto lg:h-[90vh] py-[15px] px-4 sm:px-[20px] bg-gray-300 rounded-[15px] ring-[0.5px] ring-gray-800">
            <p className="text-lg sm:text-[20px] mb-2">Notifications</p>

            {notifications && notifications.length > 0 ? (
              <div className="max-h-[60vh] lg:max-h-full overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="bg-white p-2 sm:p-[10px] rounded-[5px] mt-[10px]"
                  >
                    <p className="text-sm sm:text-base font-medium">{notification.title}</p>
                    <p className="text-xs sm:text-[14px] text-gray-700 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:pr-[10px] mt-2 space-y-1 sm:space-y-0">
                      <p className="text-gray-500 text-[10px] sm:text-[12px]">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-[12px]">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20">
                <p className="text-sm sm:text-base text-gray-600">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Max />
      <Footer />
    </div>
  );
}
