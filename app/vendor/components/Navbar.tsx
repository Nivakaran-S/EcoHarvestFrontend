"use client";

import { useState, useEffect } from "react";
import { FiBell, FiPlus, FiLogOut } from "react-icons/fi";
import ProductModal from "./ProductModal";

const BASE_URL = "https://eco-harvest-backend.vercel.app";

interface ProductData {
  name: string;
  subtitle: string;
  quantity: number | string;
  unitPrice: number | string;
  MRP: number | string;
  imageUrl: string;
  category: string;
  productCategory_id: string;
  status: string;
}

const Navbar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [vendorId, setVendorId] = useState<string>("");
  const [vendorName, setVendorName] = useState<string>("Vendor");

  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const res = await fetch(`${BASE_URL}/check-cookie`, {
          credentials: "include",
        });

        const data: { id: string; role: string } = await res.json();
        if (!res.ok || data.role !== "Vendor") {
          throw new Error("Not a vendor or unauthorized");
        }

        const userId = data.id;
        const userRes = await fetch(`${BASE_URL}/vendors/${userId}`, {
          credentials: "include",
        });
        const userData: any[] = await userRes.json();
        if (!userRes.ok || !userData[1]?.entityId) {
          throw new Error("User entityId (vendorId) not found");
        }

        const vendorEntityId = userData[1].entityId;
        const vendorInfo = userData[0];
        
        setVendorId(vendorEntityId);
        setVendorName(vendorInfo?.businessName || "Vendor");
        localStorage.setItem("vendorId", vendorEntityId);
      } catch (err) {
        console.error("Error fetching vendor ID:", err);
      }
    };

    fetchVendorId();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("vendorId");
        window.location.href = "/login";
      } else {
        alert("Logout failed!");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAddProduct = async (productData: ProductData, resetForm: () => void) => {
    if (!vendorId) {
      setToastMessage("Vendor ID not found. Please try again.");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    const fullProductData = {
      ...productData,
      vendorId,
      quantity: Number(productData.quantity),
      unitPrice: Number(productData.unitPrice),
      MRP: Number(productData.MRP),
    };

    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullProductData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const newProduct = await response.json();
      console.log("Product created successfully:", newProduct);

      setToastMessage("Product added successfully!");
      resetForm();
      setIsModalOpen(false);
      
      // Refresh the page to show new product
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("Error creating product:", err);
      setToastMessage(`Error: ${err.message}`);
    }

    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="relative  ml-[16vw]">
      <div className="flex px-[50px] justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold text-gray-800">Welcome back, {vendorName}</h1>
        <div className="flex items-center space-x-4">
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-yellow-600 transition-colors shadow-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <FiPlus className="mr-2" /> Add New Product
          </button>
          <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <FiBell size={20} />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
        toastMessage={toastMessage}
      />
    </div>
  );
};

export default Navbar;