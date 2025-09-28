"use client";
import React, { Suspense, useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import Product from "../components/Product";
import Image from "next/image";
import Star from "../images/log.png";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Loading from "../components/Loading";

// API base
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// --- Interfaces ---
interface Product {
  _id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  unitPrice: number;
  rating?: number;
  averageRating?: number; // Added based on your schema
  category?: string;
  productCategory_id?: string; // Added based on your schema
  brand?: string;
  MRP?: number; // Added based on your schema
  numberOfReviews?: number; // Added based on your schema
}

interface Category {
  _id: string;
  name: string;
  // Add other category fields as needed
}

interface ProductCategory {
  _id: string;
  name: string;
  // Add other fields based on your ProductCategory model
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

interface Discount {
  _id: string;
  productId: { _id: string };
  percentage: number;
  status: boolean;
  startDate: string;
  endDate: string;
}

interface UserData {
  id: string;
  role: string;
}

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") || "";
  const categoryName = searchParams.get("categoryName") || "All Categories";

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]); // Updated
  const [loading, setLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true); // Added
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  // Mobile filters state
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Filters
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortOption, setSortOption] = useState<string>("Featured");

  // Cart & user
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart | undefined>(undefined);
  const [productsDetail, setProductsDetail] = useState<Product[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);

  // --- Fetch cookies (user login state) ---
  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get<UserData>(`${BASE_URL}/check-cookie/`, {
          withCredentials: true,
        });

        setId(response.data.id);
        setRole(response.data.role);

        if (["Customer", "Company"].includes(response.data.role)) {
          setUserLoggedIn(true);
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch {
        setUserLoggedIn(false);
      }
    };
    fetchCookies();
  }, [router]);

  // --- Fetch cart ---
  useEffect(() => {
    const fetchCart = async () => {
      if (!userLoggedIn || !id) return;
      try {
        const response = await axios.get<{ cart: Cart; products: Product[] }>(
          `${BASE_URL}/cart/${id}`
        );
        setCart(response.data.cart);
        setProductsDetail(response.data.products);
        setNumberOfCartItems(response.data.cart.products.length);
      } catch {
        setCart(undefined);
      }
    };
    fetchCart();
  }, [id, userLoggedIn]);

  // --- Fetch categories ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ProductCategory[]>(`${BASE_URL}/productcategories/`);
        setProductCategories(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // --- Fetch products (FIXED) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url;
        
        // If categoryId is provided, use the category-specific endpoint
        if (categoryId && categoryId !== "") {
          url = `${BASE_URL}/products/category/${categoryId}`;
        } else {
          // For "All Categories", use the general products endpoint
          url = `${BASE_URL}/products`;
        }
        
        const response = await axios.get<Product[]>(url);
        setProducts(response.data);

        // Price range setup
        if (response.data.length > 0) {
          const prices = response.data.map((p) => p.unitPrice || 0);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setMinPrice(min);
          setMaxPrice(max);
          setPriceRange([min, max]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  // --- Fetch discounts ---
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get<Discount[]>(`${BASE_URL}/api/discount/`);
        setDiscounts(response.data);
      } catch (error) {
        console.error("Error fetching discounts", error);
      }
    };
    fetchDiscounts();
  }, []);

  // --- Filtering + Sorting (UPDATED to use averageRating) ---
  useEffect(() => {
    const filtered = products.filter(
      (p) =>
        p.unitPrice >= priceRange[0] &&
        p.unitPrice <= priceRange[1] &&
        (!selectedBrands.length || selectedBrands.includes(p.brand || "")) &&
        (p.averageRating || p.rating || 0) >= minRating // Use averageRating first, fallback to rating
    );

    switch (sortOption) {
      case "Price: Low to High":
        filtered.sort((a, b) => a.unitPrice - b.unitPrice);
        break;
      case "Price: High to Low":
        filtered.sort((a, b) => b.unitPrice - a.unitPrice);
        break;
      case "Highly Rated":
        filtered.sort((a, b) => (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0));
        break;
    }

    setSortedProducts(filtered);
  }, [products, priceRange, selectedBrands, minRating, sortOption]);

  // --- Handlers ---
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Handle category selection
  const handleCategoryClick = (selectedCategoryId: string, selectedCategoryName: string) => {
    // Update URL with new category parameters
    router.push(`/category?categoryId=${selectedCategoryId}&categoryName=${encodeURIComponent(selectedCategoryName)}`);
    setShowMobileFilters(false); // Close mobile filters
  };

  const handleAllCategoriesClick = () => {
    // Update URL to show all categories
    router.push(`/category?categoryName=All%20Categories`);
    setShowMobileFilters(false); // Close mobile filters
  };

  // Mobile filter toggle
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Filter component (reusable for both desktop and mobile)
  const FiltersContent = () => (
    <div className="mt-[15px] space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Category</h3>
        <div className="space-y-2">
          {categoriesLoading ? (
            <div className="text-gray-500 text-sm">Loading categories...</div>
          ) : (
            <>
              {/* All Categories option */}
              <p
                className={`cursor-pointer text-sm md:text-base py-1 px-2 rounded transition-colors ${
                  (!categoryId || categoryName === "All Categories") 
                    ? "text-[#FDAA1C] font-semibold bg-orange-50" 
                    : "hover:text-gray-500 hover:bg-gray-50"
                }`}
                onClick={handleAllCategoriesClick}
              >
                All Categories
              </p>
              
              {/* Dynamic categories */}
              {productCategories.map((category) => (
                <p
                  key={category._id}
                  className={`cursor-pointer text-sm md:text-base py-1 px-2 rounded transition-colors ${
                    categoryId === category._id 
                      ? "text-[#FDAA1C] font-semibold bg-orange-50" 
                      : "hover:text-gray-500 hover:bg-gray-50"
                  }`}
                  onClick={() => handleCategoryClick(category._id, category.name)}
                >
                  {category.name}
                </p>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Price</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              className="w-full accent-[#FDAA1C] h-2 cursor-pointer"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-full accent-[#FDAA1C] h-2 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-sm font-medium bg-gray-100 p-2 rounded">
            <span>Rs. {priceRange[0]}</span>
            <span>Rs. {priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Reviews</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`flex items-center cursor-pointer p-2 rounded transition-colors ${
                minRating === star ? 'bg-orange-50 border border-[#FDAA1C]' : 'hover:bg-gray-50'
              }`}
              onClick={() => setMinRating(minRating === star ? 0 : star)}
            >
              <div className="flex items-center">
                {Array.from({ length: star }).map((_, idx) => (
                  <Image
                    key={idx}
                    src={Star}
                    alt="Star"
                    width={12}
                    height={12}
                    className="md:w-4 md:h-4"
                  />
                ))}
                <span className="ml-2 text-sm">& Up</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <Loading/>;
  }

  return (
    <div className="bg-white flex text-black overflow-x-hidden flex-col items-center justify-center">
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={productsDetail}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0  z-50 md:hidden">
          <div onClick={() => setShowMobileFilters(false)} className="bg-black h-[100%] opacity-50"></div>
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-51 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl cursor-pointer font-semibold">Filters</h2>
                <button
                  onClick={toggleMobileFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FiltersContent />
            </div>
          </div>
        </div>
      )}

      <div className="pt-[12vh] md:pt-[15vh] bg-white w-full px-3 md:w-[94vw] flex justify-center text-black">
        <div className="w-full max-w-7xl flex flex-col md:flex-row py-4 gap-4">
          
          {/* Desktop Sidebar Filters */}
          <div className="hidden md:block md:w-1/6 pr-4">
            <div className="sticky top-24">
              <FiltersContent />
            </div>
          </div>

          {/* Products Section */}
          <div className="w-full mt-[20px] md:w-5/6 md:pl-4 md:border-l md:border-gray-300">
            
            {/* Header with Filter Button and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 mb-4 gap-3">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <p className="text-sm font-medium">
                  {sortedProducts.length} results for <span className="font-semibold">{categoryName}</span>
                </p>
                
                {/* Mobile Filter Button */}
                <button
                  onClick={toggleMobileFilters}
                  className="md:hidden bg-[#FDAA1C] cursor-pointer text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#e6941a] transition-colors"
                >
                  Filters
                </button>
              </div>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-sm text-gray-700 font-medium">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-gray-400 text-gray-800 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] cursor-pointer min-w-0 flex-1 sm:flex-none"
                >
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highly Rated</option>
                </select>
              </div>
            </div>

            {/* Results Title */}
            <h2 className="text-xl  md:text-2xl font-bold mb-6 px-1">
              Results for <span className="text-[#FDAA1C]">{categoryName}</span>
            </h2>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => (
                  <Product
                    key={product._id}
                    id={product._id}
                    title={product.name}
                    subtitle={product.subtitle}
                    unitPrice={product.unitPrice}
                    imageUrl={product.imageUrl}
                    discounts={discounts}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-600 font-medium">No products found</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search criteria</p>
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
};

function Category(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryPage />
    </Suspense>
  );
}

export default Category;