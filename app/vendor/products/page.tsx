"use client";

import { useEffect, useState } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import EditProductModal from "../components/EditProductModal";
import { Product } from "../components/types";

const BASE_URL = "https://eco-harvest-backend.vercel.app";

const Products: React.FC = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const productsPerPage = 8;

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const vendorId = localStorage.getItem("vendorId");
        if (!vendorId) {
          console.error("Vendor ID not found");
          return;
        }

        const res = await fetch(`${BASE_URL}/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        
        const allProducts: Product[] = await res.json();
        const vendorProducts = allProducts.filter(p => p.vendorId === vendorId);
        setProducts(vendorProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.subtitle && product.subtitle.toLowerCase().includes(query));
    
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="flex text-black min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 ml-[20vw]">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Products Management</h2>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Categories</option>
                <option value="Resell">Resell</option>
                <option value="Recycling">Recycling</option>
                <option value="Fertilizer">Fertilizer</option>
              </select>

              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="No Stock">No Stock</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading products...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No products found.
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        currentPage === i + 1
                          ? "bg-yellow-500 text-white border-yellow-500"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          <EditProductModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            product={selectedProduct}
            onSave={handleProductUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;