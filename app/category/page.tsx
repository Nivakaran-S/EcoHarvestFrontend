"use client";
import React, { Suspense } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import Product from "../components/Product";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Star from "../images/log.png";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";

// Base URL for API
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// TypeScript interfaces
interface Product {
  _id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  unitPrice: number;
  rating?: number;
  category?: string;
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
  const [width, setWidth] = useState<number>(0);
  const selectRef = useRef<HTMLSelectElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") || "";
  const categoryName = searchParams.get("categoryName") || "All Categories";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart | undefined>(undefined);
  const [productsDetail, setProductsDetail] = useState<Product[]>([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [priceRangeMin, setPriceRangeMin] = useState<number>(0);
  const [priceRangeMax, setPriceRangeMax] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("Featured");
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);

  const router = useRouter();

  const updateWidth = () => {
    if (selectRef.current && textRef.current) {
      const selectedText = selectRef.current.options[selectRef.current.selectedIndex].text;
      textRef.current.textContent = selectedText;
      setWidth(textRef.current.offsetWidth + 20);
      setSelectedOption(selectedText);
    }
  };

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Fetch user cookie data
  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get<UserData>(`${BASE_URL}/check-cookie/`, {
          withCredentials: true,
        });

        setId(response.data.id);
        setRole(response.data.role);

        if (response.data.role === "Customer" || response.data.role === "Company") {
          setUserLoggedIn(true);
        } else if (response.data.role === "Vendor") {
          router.push("/vendor");
        } else if (response.data.role === "Admin") {
          router.push("/admin");
        }
      } catch (error) {
        setUserLoggedIn(false);
      }
    };

    fetchCookies();
  }, [router]);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!userLoggedIn) return;
      try {
        const response = await axios.get<{ cart: Cart; products: Product[] }>(
          `${BASE_URL}/cart/${id}`
        );
        setCart(response.data.cart);
        setProductsDetail(response.data.products);
        setNumberOfCartItems(response.data.cart.products.length);
      } catch (err) {
        console.log("Cart Empty");
        setCart(undefined);
      }
    };
    fetchCart();
  }, [id, userLoggedIn]);

  // Fetch products for the category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`${BASE_URL}/products?category=${categoryId}`);
        setProducts(response.data);

        const prices = response.data.map((p) => p.unitPrice || 0);
        const max = Math.max(...prices);
        const min = Math.min(...prices);

        setMaxPrice(max);
        setMinPrice(min);
        setPriceRangeMin(min);
        setPriceRangeMax(max);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  // Fetch discounts
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

  // Sorting and filtering products
  useEffect(() => {
    const sortProducts = () => {
      const filteredProducts = products.filter(
        (product) => product.unitPrice >= priceRangeMin && product.unitPrice <= priceRangeMax
      );

      const sorted = [...filteredProducts];

      switch (selectedOption) {
        case "Price: Low to High":
          sorted.sort((a, b) => a.unitPrice - b.unitPrice);
          break;
        case "Price: High to Low":
          sorted.sort((a, b) => b.unitPrice - a.unitPrice);
          break;
        case "Highly Rated":
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          break;
      }

      setSortedProducts(sorted);
    };

    sortProducts();
  }, [selectedOption, products, priceRangeMin, priceRangeMax]);

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

      <div className="pt-[15vh] w-full flex justify-center text-black">
        <div className="w-[95%] flex flex-row py-4">
          {/* Filters Sidebar */}
          <div className="w-1/6 pr-4">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Category</h3>
                <div className="mt-2 space-y-2">
                  {["All Categories", "Daily Grocery", "Drinks", "Tea and Coffee"].map((category) => (
                    <p
                      key={category}
                      className={`cursor-pointer ${
                        category === categoryName ? "text-[#FDAA1C]" : "hover:text-gray-500"
                      }`}
                      onClick={() => router.push(`/category?categoryName=${encodeURIComponent(category)}`)}
                    >
                      {category}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Price</h3>
                <div className="mt-2">
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRangeMin}
                    onChange={(e) => setPriceRangeMin(Number(e.target.value))}
                    className="w-full accent-[#FDAA1C] h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span>Rs. {priceRangeMin}</span>
                    <span>Rs. {priceRangeMax}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Brands</h3>
                <div className="mt-2 space-y-2">
                  {["Anchor", "Nestle", "Ambewela", "Elephant House"].map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="accent-[#FDAA1C] cursor-pointer"
                        onChange={() => {}}
                      />
                      <span>{brand}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Customer Reviews</h3>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Image
                      key={star}
                      src={Star}
                      alt="Star"
                      width={15}
                      height={15}
                      className="cursor-pointer"
                    />
                  ))}
                  <span className="ml-1 text-sm">& Up</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="w-5/6 pl-4 border-l border-gray-300">
            <div className="flex justify-between items-center bg-gray-100 rounded px-4 py-2 mb-4">
              <p className="text-sm">Showing {sortedProducts.length} results for {categoryName}</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Sort by:</span>
                <div className="relative">
                  <span
                    ref={textRef}
                    className="absolute opacity-0 pointer-events-none whitespace-nowrap"
                  >
                    Featured
                  </span>
                  <select
                    ref={selectRef}
                    onChange={updateWidth}
                    style={{ width }}
                    className="bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option>Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Highly Rated</option>
                  </select>
                </div>
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
                  <p>No products found in this category</p>
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