// Products.tsx
"use client";

import { useEffect, useState } from "react";
import { FiChevronDown, FiFilter } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import EditProductModal from "../components/EditProductModal";
import axios from "axios";
import { Product } from "../components/types";

// ===== Base URL =====
const BASE_URL = "https://eco-harvest-backend.vercel.app";

const Products: React.FC = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [productCategories, setProductCategories] = useState<{ _id: string; name: string }[]>([]);
  const productsPerPage = 4;

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<Product[]>(`${BASE_URL}/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<{ _id: string; name: string }[]>(`${BASE_URL}/productcategories/`);
        setProductCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.subtitle && product.subtitle.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        <Navbar />

        <div className="flex justify-between items-center my-4">
          <h2 className="text-2xl font-bold">Products</h2>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="relative">
            <button
              className="flex items-center px-3 py-2 bg-white border rounded-md shadow min-w-[150px]"
              onClick={() => setShowCategoryDropdown((prev) => !prev)}
            >
              All Categories <FiChevronDown className="ml-2" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute left-0 mt-2 w-full bg-white border rounded shadow z-10 max-h-48 overflow-y-auto">
                {productCategories.length > 0 ? (
                  productCategories.map((category) => (
                    <div
                      key={category._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSearchQuery(category.name);
                        setShowCategoryDropdown(false);
                        setCurrentPage(1);
                      }}
                    >
                      {category.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No categories</div>
                )}
              </div>
            )}
          </div>

          <button className="flex items-center px-3 py-2 bg-white border rounded-md shadow min-w-[150px]">
            All Status <FiChevronDown className="ml-2" />
          </button>

          <button className="p-2 bg-gray-200 rounded-md">
            <FiFilter />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  ...product,
                  imageSrc: product.imageUrl.includes("drive.google.com")
                    ? `https://drive.usercontent.google.com/download?id=${
                        product.imageUrl.split("/d/")[1]?.split("/")[0]
                      }&export=view`
                    : product.imageUrl,
                  price: product.unitPrice,
                  oldPrice: product.MRP,
                  status: product.quantity > 0 ? "In Stock" : "No Stock",
                }}
                onDelete={(id) => setProducts((prev) => prev.filter((p) => p._id !== id))}
                onEdit={(product) => {
                  setSelectedProduct(product);
                  setEditModalOpen(true);
                }}
              />
            ))
          ) : (
            <p className="text-center col-span-4 text-gray-500">No products found.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        <EditProductModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          product={selectedProduct}
          onSave={handleProductUpdate}
        />
      </div>
    </div>
  );
};

export default Products;
