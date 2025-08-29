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
  };

  const handleAllCategoriesClick = () => {
    // Update URL to show all categories
    router.push(`/category?categoryName=All%20Categories`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

      <div className="pt-[15vh] bg-white w-full flex justify-center text-black">
        <div className="w-[95%] flex flex-row py-4">
          {/* Sidebar Filters */}
          <div className="w-1/6 pr-4">
            <div className="sticky top-24 space-y-6">
              {/* Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Category</h3>
                <div className="mt-2 space-y-2">
                  {categoriesLoading ? (
                    <div className="text-gray-500">Loading categories...</div>
                  ) : (
                    <>
                      {/* All Categories option */}
                      <p
                        className={`cursor-pointer ${
                          (!categoryId || categoryName === "All Categories") ? "text-[#FDAA1C] font-semibold" : "hover:text-gray-500"
                        }`}
                        onClick={handleAllCategoriesClick}
                      >
                        All Categories
                      </p>
                      
                      {/* Dynamic categories */}
                      {productCategories.map((category) => (
                        <p
                          key={category._id}
                          className={`cursor-pointer ${
                            categoryId === category._id ? "text-[#FDAA1C] font-semibold" : "hover:text-gray-500"
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
                <h3 className="text-lg font-semibold text-gray-800">Price</h3>
                <div className="mt-2 space-y-2">
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-full accent-[#FDAA1C] h-1.5 cursor-pointer"
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-full accent-[#FDAA1C] h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span>Rs. {priceRange[0]}</span>
                    <span>Rs. {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Brands</h3>
                <div className="mt-2 space-y-2">
                  {["Anchor", "Nestle", "Ambewela", "Elephant House"].map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        className="accent-[#FDAA1C] cursor-pointer"
                        onChange={() => toggleBrand(brand)}
                      />
                      <span>{brand}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Customer Reviews</h3>
                <div className="space-y-2 mt-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      className="flex items-center cursor-pointer"
                      onClick={() => setMinRating(star)}
                    >
                      {Array.from({ length: star }).map((_, idx) => (
                        <Image
                          key={idx}
                          src={Star}
                          alt="Star"
                          width={15}
                          height={15}
                        />
                      ))}
                      <span className="ml-1 text-sm">& Up</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="w-5/6 pl-4 border-l border-gray-300">
            <div className="flex justify-between items-center bg-gray-200 ring-[1px] ring-gray-400 rounded px-4 py-2 mb-4">
              <p className="text-sm">
                Showing {sortedProducts.length} results for {categoryName}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-800 ">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent border border-gray-800 text-gray-800 rounded  px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highly Rated</option>
                </select>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Results for {categoryName}</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-600">No products match your filters.</p>
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