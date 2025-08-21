'use client'
import Image from "next/image";
import Navigation from "../components/Navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";


const BASE_URL = "https://eco-harvest-backend.vercel.app"; 

// Shared interfaces
interface UserData {
  id: string;
  role: string;
  username: string;
  createdTimestamp: string;
}

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
}

interface Membership {
  type: string;
}

interface Notification {
  title: string;
  message: string;
  createdAt: string;
}

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
}

interface ProductDetail {
  _id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  unitPrice: number;
  status?: string;
}

interface Cart {
  _id: string;
  products: CartItem[];
  totalAmount: number;
}

interface NavigationProps {
  numberOfCartItems: number;
  productsDetail: ProductDetail[];
  cart: Cart | null;
  id: string;
  userLoggedIn: boolean;
}

export default function AccountManagement() {
  const [id, setId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart | undefined>(undefined);
  const [productsDetail, setProductsDetail] = useState<ProductDetail[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [editProfile, setEditProfile] = useState<boolean>(false);

  const router = useRouter();

  const [userInformation, setUserInformation] = useState<[UserData, Membership, CustomerDetails] | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get<UserData>(
          `${BASE_URL}/check-cookie/`,
          { withCredentials: true }
        );

        const userId = response.data.id;

        try {
          const response2 = await axios.get<[UserData, Membership, CustomerDetails]>(
            `${BASE_URL}/customers/details/:${userId}`
          );
          setUserInformation(response2.data);
          setFirstName(response2.data[2].firstName);
          setLastName(response2.data[2].lastName);
          setEmail(response2.data[2].email);
          setPhoneNumber(response2.data[2].phoneNumber);
          setAddress(response2.data[2].address);
          setDateOfBirth(response2.data[2].dateOfBirth);
          setUsername(response2.data[0].username);

          try {
            const response3 = await axios.get<Notification[]>(
              `${BASE_URL}/notification/:${userId}`
            );
            setNotifications(response3.data);
          } catch (err) {
            console.error("Error fetching notifications:", err);
          }
        } catch (err) {
          console.error("Error fetching user information:", err);
        }

        setId(userId);
        setRole(response.data.role);

        if (response.data.role === "Customer") {
          setUserLoggedIn(true);
          try {
            const cartResponse = await axios.get<{ cart: Cart; products: ProductDetail[] }>(
              `${BASE_URL}/cart/${userId}`
            );
            setCart(cartResponse.data.cart);
            setProductsDetail(cartResponse.data.products);
            setNumberOfCartItems(cartResponse.data.cart.products.length);
          } catch (err) {
            console.log("Cart is empty");
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

  const handleUpdateProfile = async () => {
    try {
      await axios.post(
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
          password
        }
      );
      setEditProfile(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div>
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />
      {/* ...rest of your JSX */}
      <Max/>
      <Footer/>
    </div>
  );
}
