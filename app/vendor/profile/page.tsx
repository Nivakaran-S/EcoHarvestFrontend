"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FiCamera, FiSave, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";

const BASE_URL = "https://eco-harvest-backend.vercel.app";

interface VendorInfo {
  _id?: string;
  businessName?: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface UserData {
  entityId?: string;
  username?: string;
}

export default function ProfilePage() {
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [businessName, setBusinessName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/check-cookie`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to check cookie");

        const data = await res.json();

        if (data.role !== "Vendor") {
          throw new Error("Not authorized or not a vendor");
        }

        const userIdFromCookie: string = data.id;
        setUserId(userIdFromCookie);

        const userRes = await fetch(`${BASE_URL}/vendors/${userIdFromCookie}`, {
          credentials: "include",
        });

        if (!userRes.ok) throw new Error("Failed to fetch vendor data");

        const userData: [VendorInfo | null, UserData | null] = await userRes.json();

        const vendorInfo = userData?.[0] ?? null;
        const userDetails = userData?.[1] ?? null;

        if (!vendorInfo || !userDetails) {
          throw new Error("Vendor info missing");
        }

        setVendor(vendorInfo);
        setBusinessName(vendorInfo.businessName || "");
        setPhoneNumber(vendorInfo.phoneNumber || "");
        setEmail(vendorInfo.email || "");
        setFirstName(vendorInfo.firstName || "");
        setLastName(vendorInfo.lastName || "");
        setUsername(userDetails.username || "");
      } catch (err: any) {
        console.error("Error fetching vendor profile:", err);
        setMessage({ type: 'error', text: err.message || "Failed to load profile" });
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProfile();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    setMessage(null);

    try {
      const updateData: any = {
        vendorId: userId,
        businessName,
        phoneNumber,
        email,
        username,
        firstName,
        lastName,
      };

      if (password.trim()) {
        updateData.password = password;
      }

      const res = await fetch(`${BASE_URL}/api/auth/updateVendor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const responseData = await res.json();
      setMessage({ type: 'success', text: "Profile updated successfully!" });
      setIsEditing(false);
      setPassword("");
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      setMessage({ type: 'error', text: error?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setBusinessName(vendor?.businessName || "");
    setPhoneNumber(vendor?.phoneNumber || "");
    setEmail(vendor?.email || "");
    setFirstName(vendor?.firstName || "");
    setLastName(vendor?.lastName || "");
    setPassword("");
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex text-black h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg font-semibold text-gray-700">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex text-black min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 ml-[270px] px-8 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Profile Details</h2>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="flex items-center space-x-6 mb-8 pb-6 border-b">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {businessName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <label htmlFor="profileUpload" className="cursor-pointer">
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
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{businessName}</h3>
                <p className="text-gray-600">{email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  disabled={!isEditing}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  disabled={!isEditing}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  disabled={!isEditing}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  disabled={!isEditing}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled={!isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  disabled={!isEditing}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Password {!isEditing && <span className="text-sm font-normal text-gray-500">(hidden)</span>}
                </label>
                <input
                  type="password"
                  value={isEditing ? password : "*******"}
                  disabled={!isEditing}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? "Leave blank to keep current password" : ""}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Account Status</label>
                <div className="flex items-center">
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                    ✓ Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    <FiSave /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <FiX /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
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