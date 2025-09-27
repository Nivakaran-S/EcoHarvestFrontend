"use client";

import Image from "next/image";
import Cart from "../images/cartLogo2.png";
import Menu from "../images/menu.png";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import LogoutButton from "./Logout";
import AllNavCategories from "./AllNavCategories";
import SearchIcon from "../images/search-icon.png";
import EcoHarvest from "../images/ecoHarvestNavLogo2.png";

// Centralized API base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://eco-harvest-backend.vercel.app";

// Define interfaces for props
interface ProductCategory {
  _id: string;
  name: string;
}

interface ProductDetail {
  imageUrl: string;
  name: string;
  subtitle: string;
}

interface CartItem {
  _id: string;
  quantity: number;
}

interface Cart {
  products: CartItem[];
}

interface NavigationProps {
  id?: string;
  productsDetail: ProductDetail[];
  userLoggedIn: boolean;
  cart?: Cart;
  numberOfCartItems: number;
}

const Navigation: React.FC<NavigationProps> = ({
  id,
  productsDetail,
  userLoggedIn,
  cart,
  numberOfCartItems,
}) => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownWidth, setDropdownWidth] = useState<string>("auto");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [customerId, setCustomerId] = useState<string | undefined>(id);
  const [query, setQuery] = useState<string>("");
  const [onCategoryHover, setOnCategoryHover] = useState<boolean>(false);
  const [navCategorySelect, setNavCategorySelect] = useState<string>("Meals & Main Courses");
  const [NumCartItems, setNumCartItems] = useState<number>(0);
  
  // Mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const [isCartHoverOpen, setIsCartHoverOpen] = useState<boolean>(false);
  
  const router = useRouter();

  useEffect(() => {
    if (textRefs.current.length > 0) {
      const maxWidth = Math.max(...textRefs.current.map((el) => el?.offsetWidth || 0));
      setDropdownWidth(`${maxWidth + 40}px`);
    }
  }, [productCategories]);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ProductCategory[]>(`${BASE_URL}/productcategories/`);
        if (isMounted) {
          setProductCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
      console.log("Cart", cart);
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavLoginClick = () => {
    router.push("/login");
  };

  const handleSearch = async () => {
    try {
      if (query) {
        router.push(
          `/search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(
            selectedCategory
          )}`
        );
        setIsMobileSearchOpen(false);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {(isMobileMenuOpen || isMobileSearchOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[99] md:hidden"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsMobileSearchOpen(false);
          }}
        />
      )}

      <div className="flex flex-col justify-center fixed top-0 z-[100] w-full items-center">
        <nav className="bg-white w-[95vw] md:w-[95vw] drop-shadow-md ring-gray-600 ring-[0.5px] mt-[5px] rounded-[10px] overflow-hidden">
          
          {/* Main Navigation Bar */}
          <div className="flex px-[15px] md:px-[30px] rounded-t-[10px] text-white bg-[#0A0A0A] justify-between items-center h-[70px] md:h-[80px]">
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`} />
              </div>
            </button>
            
            {/* Logo */}
            <div className="cursor-pointer flex-shrink-0" onClick={() => router.push("/")}>
              <Image 
                height={50} 
                width={120}
                src={EcoHarvest} 
                alt="EcoHarvest Logo" 
                className="h-[40px] md:h-[50px] w-auto"
              />
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-row ml-[10px] w-full max-w-[600px]">
              {/* Hidden width measurement elements */}
              <div className="absolute invisible">
                {productCategories.map((category, index) => (
                  <span
                    key={category._id}
                    ref={(el) => {
                      textRefs.current[index] = el;
                    }}
                    className="whitespace-nowrap"
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              {/* Categories dropdown */}
              <div
                className="bg-[#E6E6E6] border border-r-gray-400 h-[45px] flex items-center justify-center rounded-l-[5px]"
                style={{ width: dropdownWidth, minWidth: '120px' }}
              >
                <select
                  className="focus:outline-none bg-transparent text-[14px] h-full cursor-pointer pl-[10px] mr-[5px] text-black w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {loading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    productCategories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Search input */}
              <div className="bg-white flex flex-row flex-1 items-center">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="placeholder-gray-600 focus:outline-none w-full px-[18px] py-[12px] text-black text-[14px]"
                  placeholder="Search Anything"
                />
              </div>

              {/* Search button */}
              <div
                onClick={handleSearch}
                className="bg-[#FDAA1C] flex items-center justify-center cursor-pointer h-[45px] w-[45px] rounded-r-[5px] hover:bg-[#e6941a] transition-colors"
              >
                <Image src={SearchIcon} height={18} width={18} alt="Search Icon" />
              </div>
            </div>

            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={toggleMobileSearch}
              aria-label="Search"
            >
              <Image src={SearchIcon} height={20} width={20} alt="Search Icon" />
            </button>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Login/Logout */}
              {!userLoggedIn ? (
                <div className="hidden sm:flex flex-col items-center justify-center leading-[18px]">
                  <p className="text-[12px]">Hello!</p>
                  <div
                    className="bg-[#FDAA1C] cursor-pointer text-black px-[14px] py-[3px] text-[13px] rounded-full flex items-center justify-center hover:bg-[#e6941a] transition-colors"
                    onClick={handleNavLoginClick}
                  >
                    <p>Login</p>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:block">
                  <LogoutButton />
                </div>
              )}

              {/* Mobile Login Button */}
              {!userLoggedIn && (
                <button
                  className="sm:hidden bg-[#FDAA1C] text-black px-3 py-1 rounded-full text-sm hover:bg-[#e6941a] transition-colors"
                  onClick={handleNavLoginClick}
                >
                  Login
                </button>
              )}

              {/* Cart */}
              <div 
                className="relative group"
                onMouseEnter={() => setIsCartHoverOpen(true)}
                onMouseLeave={() => setIsCartHoverOpen(false)}
              >
                <div className="cursor-pointer relative" onClick={() => router.push("/cart")}>
                  <Image
                    src={Cart}
                    alt="Cart"
                    width={50}
                    height={50}
                    className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]"
                  />
                  <span className="text-[#FFCC29] absolute -top-2 font-bold -right-1 text-[20px] md:text-[24px] bg-[#0A0A0A] rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[14px] md:text-[16px]">
                    {numberOfCartItems}
                  </span>
                </div>

                {/* Cart Hover Dropdown - Desktop Only */}
                <div className={`w-[300px] md:w-[400px] bg-[#F5F5F5] ${isCartHoverOpen ? 'block' : 'hidden'} p-[10px] absolute right-0 md:right-[2%] top-[55px] md:top-[60px] drop-shadow-lg rounded-[10px] ring-gray-800 ring-[0.5px] z-[110] hidden md:block`}>
                  <div className="max-h-[300px] overflow-y-auto">
                    {cart && cart.products && cart.products.length > 0 ? (
                      cart.products.slice(0, 3).map((item) =>
                        productsDetail
                          .filter(product => product.name) // Only show products with details
                          .slice(0, 1) // Limit to prevent too many items
                          .map((product) => (
                          <div
                            key={item._id}
                            className="bg-white w-full flex space-x-[8px] cursor-pointer flex-row justify-between min-h-[75px] rounded-[5px] ring-[0.5px] ring-gray-800 items-center text-black p-[8px] mb-2 last:mb-0"
                          >
                            <div className="h-[60px] w-[60px] flex-shrink-0 overflow-hidden flex items-center justify-center bg-[#fff] rounded-[5px]">
                              <Image src={product.imageUrl} width={50} height={50} alt="product" className="object-cover" />
                            </div>
                            <div className="flex-1 leading-[16px] min-w-0">
                              <p className="text-[14px] md:text-[16px] leading-[17px] truncate">
                                {product.name}
                              </p>
                              <p className="text-[12px] md:text-[13px] text-gray-600 truncate">{product.subtitle}</p>
                              <p className="text-[12px] md:text-[13px]">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))
                      )
                    ) : userLoggedIn ? (
                      <p className="text-black px-[20px] py-[20px] text-center">No products in the cart</p>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4">
                        <p className="text-black text-center leading-[20px] mb-4">
                          Please login to add products to your cart
                        </p>
                        <button
                          onClick={() => router.push("/login")}
                          className="text-black bg-[#FDAA1C] w-full py-[8px] flex items-center justify-center rounded-[5px] cursor-pointer hover:bg-[#e6941a] transition-colors"
                        >
                          Login
                        </button>
                      </div>
                    )}
                  </div>
                  {userLoggedIn && cart && cart.products && cart.products.length > 0 && (
                    <button
                      onClick={() => router.push("/cart")}
                      className="text-black bg-[#FDAA1C] w-full py-[8px] flex items-center justify-center rounded-[5px] cursor-pointer mt-[8px] hover:bg-[#e6941a] transition-colors"
                    >
                      View All Products
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className={`md:hidden bg-white transition-all duration-300 overflow-hidden ${
            isMobileSearchOpen ? 'max-h-[100px] border-t border-gray-200' : 'max-h-0'
          }`}>
            <div className="p-4 space-y-3">
              {/* Category Select */}
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FDAA1C] text-black bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {loading ? (
                  <option disabled>Loading...</option>
                ) : (
                  productCategories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
              
              {/* Search Input */}
              <div className="flex space-x-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FDAA1C] placeholder-gray-500 text-black"
                  placeholder="Search products..."
                />
                <button
                  onClick={handleSearch}
                  className="bg-[#FDAA1C] px-4 py-3 rounded-lg hover:bg-[#e6941a] transition-colors"
                >
                  <Image src={SearchIcon} height={20} width={20} alt="Search" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Bottom Navigation */}
          <div className="hidden md:flex rounded-b-[9px] flex-row items-center px-[20px] text-[14.5px] text-black space-x-[20px] w-full h-[40px] bg-[#808080]">
            <div
              onMouseEnter={() => setOnCategoryHover(true)}
              onMouseLeave={() => setOnCategoryHover(false)}
              className="flex flex-row cursor-pointer space-x-[4px] items-center hover:text-white transition-colors"
            >
              <Image
                alt="Menu"
                src={Menu}
                width={19}
                height={15}
                className="h-[15px] w-[19px]"
              />
              <p>All Categories</p>
            </div>
            
            <div onClick={() => router.push("/order-history")} className="cursor-pointer hover:text-white transition-colors">
              <p>Order History</p>
            </div>
            
            <div onClick={() => router.push("/account")} className="cursor-pointer hover:text-white transition-colors">
              <p>Account Management</p>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden bg-white transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-[400px] border-t border-gray-200' : 'max-h-0'
          }`}>
            <div className="p-4 space-y-1">
              <div 
                className="py-3 px-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3"
                onClick={() => {
                  setOnCategoryHover(!onCategoryHover);
                }}
              >
                <Image src={Menu} width={19} height={15} alt="Menu" />
                <span>All Categories</span>
              </div>
              
              <div 
                className="py-3 px-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  router.push("/order-history");
                  setIsMobileMenuOpen(false);
                }}
              >
                Order History
              </div>
              
              <div 
                className="py-3 px-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  router.push("/account");
                  setIsMobileMenuOpen(false);
                }}
              >
                Account Management
              </div>

              {userLoggedIn ? (
                <div className="pt-2 border-t border-gray-200">
                  <LogoutButton />
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleNavLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#FDAA1C] text-black py-3 rounded-lg hover:bg-[#e6941a] transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Categories Dropdown (Desktop) */}
        <div
          className={`${onCategoryHover ? "max-h-[72vh]" : "max-h-0"} 
                      transition-all duration-500 
                      overflow-hidden 
                      origin-top 
                      flex justify-center
                      hidden md:flex`}
        >
          <div
            onMouseEnter={() => setOnCategoryHover(true)}
            onMouseLeave={() => setOnCategoryHover(false)}
            className="bg-white w-[93vw] overflow-hidden ring-[0.5px] text-black 
                      flex flex-row ring-gray-500 rounded-b-[20px]"
          >
            <div className="flex flex-col w-full overflow-hidden items-center justify-center">
              <AllNavCategories />
            </div>
          </div>
        </div>

        {/* Mobile Categories (when expanded) */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          onCategoryHover ? 'max-h-[400px]' : 'max-h-0'
        }`}>
          <div className="bg-white w-[95vw] mx-auto ring-[0.5px] ring-gray-500 rounded-b-[20px] mt-1">
            <div className="p-4">
              <AllNavCategories />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;