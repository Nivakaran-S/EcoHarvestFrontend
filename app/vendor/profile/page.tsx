"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FiCamera } from "react-icons/fi";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// ===== Base URL =====
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// ===== Vendor type =====
interface VendorInfo {
  _id?: string;
  businessName?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

interface UserData {
  entityId?: string;
  username?: string;
}

export default function ProfilePage() {
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [businessName, setBusinessName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        // Step 1: Check cookie & role
        const res = await fetch(`${BASE_URL}/check-cookie`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to check cookie");

        const data = await res.json();

        if (data.role !== "Vendor") {
          throw new Error("Not authorized or not a vendor");
        }

        const userId: string = data.id;
        if (!userId) throw new Error("User ID not found in cookie check");

        // Step 2: Fetch vendor info
        const userRes = await fetch(`${BASE_URL}/vendors/${userId}`, {
          credentials: "include",
        });

        if (!userRes.ok) throw new Error("Failed to fetch vendor data");

        const userData: [VendorInfo | null, UserData | null] = await userRes.json();

        const vendorInfo = userData?.[0] ?? null;
        const userDetails = userData?.[1] ?? null;

        if (!vendorInfo || !userDetails?.entityId) {
          throw new Error(
            `Vendor info or entityId missing. Vendor: ${JSON.stringify(
              vendorInfo
            )}, User: ${JSON.stringify(userDetails)}`
          );
        }

        // Step 3: Set state safely
        setVendorId(userDetails.entityId);
        setVendor(vendorInfo);

        setBusinessName(vendorInfo.businessName || "");
        setPhoneNumber(vendorInfo.phoneNumber || "");
        setEmail(vendorInfo.email || "");
        setUsername(userDetails.username || "");
      } catch (err: any) {
        console.error("Error fetching vendor ID:", err);
        toast.error(err.message || "Failed to load profile");
        router.push("/login");
      }
    };

    fetchVendorId();
  }, [router]);

  const handleSave = async () => {
    if (!vendorId) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/vendors/${vendorId}`,
        {
          businessName,
          phoneNumber,
          email,
          username,
          password,
        },
        { withCredentials: true }
      );

      if (!res.data.vendor) {
        throw new Error("Vendor update response missing vendor object");
      }

      setVendor(res.data.vendor);
      setIsEditing(false);
      toast.success("Vendor profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      toast.error(error?.message || "Failed to update vendor profile.");
    }
  };

  return (
    <div className="flex text-black h-screen bg-gray-100">
      <Toaster />
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex flex-col px-8 py-6">
          <h2 className="text-2xl font-semibold">Profile Details</h2>
          <p className="text-gray-600">Manage your account information</p>

          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md cursor-pointer">
                  <label htmlFor="profileUpload">
                    <FiCamera className="text-yellow-500" size={18} />
                  </label>
                  <input
                    type="file"
                    id="profileUpload"
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-gray-700 font-medium">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  disabled={!isEditing}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  disabled={!isEditing}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled={!isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password || "*******"}
                  disabled={!isEditing}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  disabled={!isEditing}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Account Status
                </label>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm">
                  Active
                </span>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
