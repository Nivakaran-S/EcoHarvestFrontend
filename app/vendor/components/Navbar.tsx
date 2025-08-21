"use client";

import { useState, useEffect } from "react";
import { FiBell, FiPlus, FiLogOut } from "react-icons/fi";
import ProductModal from "./ProductModal";

interface ProductData {
  name: string;
  subtitle: string;
  quantity: number | string;
  unitPrice: number | string;
  MRP: number | string;
  imageUrl: string;
  [key: string]: any;
}

const Navbar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [vendorId, setVendorId] = useState<string>("");

  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const res = await fetch("http://localhost:8000/check-cookie", {
          credentials: "include",
        });

        const data: { id: string; role: string } = await res.json();
        if (!res.ok || data.role !== "Vendor") {
          throw new Error("Not a vendor or unauthorized");
        }

        const userId = data.id;
        const userRes = await fetch(`http://localhost:8000/vendors/${userId}`, {
          credentials: "include",
        });
        const userData: any[] = await userRes.json();
        if (!userRes.ok || !userData[1]?.entityId) {
          throw new Error("User entityId (vendorId) not found");
        }

        console.log("vendorId", userData[1].entityId);
        setVendorId(userData[1].entityId);
      } catch (err) {
        console.error("Error fetching vendor ID:", err);
      }
    };

    fetchVendorId();
  }, []);

  useEffect(() => {
    if (vendorId) {
      console.log("vendorId after setState:", vendorId);
    }
  }, [vendorId]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.reload();
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
      const response = await fetch("http://localhost:8000/products", {
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
    } catch (err: any) {
      console.error("Error creating product:", err);
      setToastMessage(`${err.message}`);
    }

    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="relative">
      <div className="flex justify-between p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold">Welcome back, Green Foods Inc</h1>
        <div className="flex space-x-4">
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <FiPlus className="mr-2" /> Add New Product
          </button>
          <button className="p-2 bg-gray-200 rounded-full">
            <FiBell />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>

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
