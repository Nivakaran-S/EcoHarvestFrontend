"use client";

import Image from "next/image";
import Cart from "../images/cartLogo2.png";
import Menu from "../images/menu.png";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
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
  const [query, setQuery] = useState<string>("");
  const [onCategoryHover, setOnCategoryHover] = useState<boolean>(false);
  
  // Mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const [isCartHoverOpen, setIsCartHoverOpen] = useState<boolean>(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState<boolean>(false);
  
  const router = useRouter();

  // Calculate dropdown width effect
  useEffect(() => {
    if (textRefs.current.length > 0) {
      const maxWidth = Math.max(
        ...textRefs.current
          .filter(el => el !== null)
          .map(el => el!.offsetWidth || 0)
      );
      setDropdownWidth(`${maxWidth + 40}px`);
    }
  }, [productCategories]);

  // Fetch categories effect
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
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close mobile menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen || isMobileSearchOpen || isMobileCategoriesOpen) {
        const nav = document.querySelector('nav');
        const sidebar = document.querySelector('[data-mobile-sidebar]');
        if (nav && !nav.contains(target) && sidebar && !sidebar.contains(target)) {
          setIsMobileMenuOpen(false);
          setIsMobileSearchOpen(false);
          setIsMobileCategoriesOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isMobileSearchOpen, isMobileCategoriesOpen]);

  // Handle navigation to login
  const handleNavLoginClick = useCallback(() => {
    router.push("/login");
  }, [router]);

  // Handle search functionality
  const handleSearch = useCallback(async () => {
    try {
      if (query.trim()) {
        router.push(
          `/search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(
            selectedCategory
          )}`
        );
        setIsMobileSearchOpen(false);
        setQuery(""); // Clear search after searching
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  }, [query, selectedCategory, router]);

  // Handle enter key press in search
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    setIsMobileSearchOpen(false); // Close search when opening menu
  }, []);

  // Toggle mobile search
  const toggleMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(prev => !prev);
    setIsMobileMenuOpen(false); // Close menu when opening search
  }, []);

  // Close all mobile menus
  const closeMobileMenus = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsMobileCategoriesOpen(false);
  }, []);

  // Handle category hover with proper cleanup
  const handleCategoryMouseEnter = useCallback(() => {
    setOnCategoryHover(true);
  }, []);

  const handleCategoryMouseLeave = useCallback(() => {
    setOnCategoryHover(false);
  }, []);

  // Handle cart hover
  const handleCartMouseEnter = useCallback(() => {
    setIsCartHoverOpen(true);
    console.log('Cart hover enter - userLoggedIn:', userLoggedIn, 'isCartHoverOpen:', true);
  }, [userLoggedIn]);

  const handleCartMouseLeave = useCallback(() => {
    setIsCartHoverOpen(false);
    console.log('Cart hover leave - isCartHoverOpen:', false);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {(isMobileMenuOpen || isMobileSearchOpen || isMobileCategoriesOpen) && (
        <div 
          className="fixed inset-0 bg-black   opacity-50 z-[99] md:hidden"
          onClick={closeMobileMenus}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              closeMobileMenus();
            }
          }}
        />
      )}

      {/* Mobile Categories Sidebar */}
      <div className={`md:hidden fixed top-0 ring-[1px] ring-white left-0 h-full w-[280px] bg-white shadow-lg z-[101] transform transition-transform duration-300 ${
        isMobileCategoriesOpen ? 'translate-x-0' : '-translate-x-full'
      }`} data-mobile-sidebar>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#0A0A0A]">
            <h2 className="text-2xl sm:text-lg font-semibold text-white">Categories</h2>
            <button
              onClick={() => setIsMobileCategoriesOpen(false)}
              className="text-white cursor-pointer hover:bg-gray-800 p-2 rounded-md transition-colors"
              aria-label="Close categories"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Categories Content */}
          <div className="flex-1  overflow-y-auto sm:p-4">
            <AllNavCategories />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center fixed top-0 z-[100] w-full items-center">
        <nav className="bg-white w-[95vw] max-w-[1400px] drop-shadow-md ring-gray-600 ring-[0.5px] mt-[5px] rounded-[10px] ">
          
          {/* Main Navigation Bar */}
          <div className="flex px-3 md:px-[30px] rounded-[10px] sm:rounded-b-[0px]  sm:rounded-t-[10px] text-white bg-[#0A0A0A] justify-between items-center h-[60px] md:h-[80px]">
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 cursor-pointer text-white hover:bg-gray-800 rounded-md transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
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
            <div 
              className="cursor-pointer flex-shrink-0" 
              onClick={() => router.push("/")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  router.push("/");
                }
              }}
            >
              <Image 
                height={50} 
                width={120}
                src={EcoHarvest} 
                alt="EcoHarvest Logo" 
                className="h-[35px] md:h-[50px] w-auto"
                priority
              />
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-row ml-[10px] w-full mx-[30px]">
              {/* Hidden width measurement elements */}
              <div className="absolute invisible pointer-events-none">
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
                  className="focus:outline-none bg-transparent text-[14px] h-full cursor-pointer pl-[10px] pr-[25px] text-black w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Product category"
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
                  className="placeholder-gray-600  focus:outline-none w-full px-[18px] py-[12px] text-black text-[14px]"
                  placeholder="Search Anything"
                  aria-label="Search products"
                />
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="bg-[#FDAA1C] flex items-center justify-center cursor-pointer h-[45px] w-[45px] rounded-r-[5px] hover:bg-[#e6941a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-offset-2"
                aria-label="Search"
                disabled={!query.trim()}
              >
                <Image src={SearchIcon} height={18} width={18} alt="" />
              </button>
            </div>

            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 text-white hover:bg-gray-800 rounded-md transition-colors"
              onClick={toggleMobileSearch}
              aria-label="Search"
              aria-expanded={isMobileSearchOpen}
            >
              <Image src={SearchIcon} height={20} width={20} alt="" />
            </button>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1 md:space-x-4">
              {/* Login/Logout */}
              {!userLoggedIn ? (
                <div className="hidden sm:flex flex-col items-center justify-center leading-[18px]">
                  <p className="text-[12px]">Hello!</p>
                  <button
                    className="bg-[#FDAA1C] cursor-pointer text-black px-[14px] py-[3px] text-[13px] rounded-full flex items-center justify-center hover:bg-[#e6941a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-offset-2"
                    onClick={handleNavLoginClick}
                  >
                    Login
                  </button>
                </div>
              ) : (
                <div className="hidden sm:block">
                  <LogoutButton />
                </div>
              )}

              {/* Mobile Login Button */}
              {!userLoggedIn && (
                <button
                  className="sm:hidden bg-[#FDAA1C] text-black px-2 py-1 rounded-full text-xs hover:bg-[#e6941a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-offset-2"
                  onClick={handleNavLoginClick}
                >
                  Login
                </button>
              )}

              {/* Cart */}
              <div 
                className="relative"
                onMouseEnter={handleCartMouseEnter}
                onMouseLeave={handleCartMouseLeave}
              >
                <button 
                  className="cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-offset-2 rounded-full p-1" 
                  onClick={() => {
                    if (!userLoggedIn) {
                      router.push("/login");
                    } else {
                      router.push("/cart");
                    }
                  }}
                  aria-label={`Cart with ${numberOfCartItems} items`}
                >
                  <Image
                    src={Cart}
                    alt=""
                    width={50}
                    height={50}
                    className="w-[35px] h-[35px] md:w-[110px] md:h-[45px]"
                  />
                  {numberOfCartItems >= 0 && (
                    <span className="text-[#FFCC29] absolute -top-[0px] font-bold -right-[-13px] rounded-full w-5 h-5 md:w-7 md:h-7 flex items-center justify-center text-[12px] md:text-[40px] ">
                      {numberOfCartItems > 99 ? '99+' : numberOfCartItems}
                    </span>
                  )}
                </button>

                {/* Cart Hover Dropdown - Shows for both logged in and logged out users */}
                {isCartHoverOpen && (
                  <div className="w-[300px] lg:w-[400px] bg-[#F5F5F5] p-[10px] absolute right-0 lg:right-[2%] top-[55px] md:top-[60px] drop-shadow-lg rounded-[10px] ring-gray-800 ring-[0.5px] z-[110] hidden md:block">
                    <div className="max-h-[300px] overflow-y-auto">
                      {!userLoggedIn ? (
                        <div className="flex flex-col items-center justify-center p-4">
                          <p className="text-black text-center leading-[20px] mb-4">
                            Please login to add products to your cart
                          </p>
                          <button
                            onClick={() => router.push("/login")}
                            className="text-black bg-[#FDAA1C] w-full py-[8px] flex items-center justify-center rounded-[5px] cursor-pointer hover:bg-[#e6941a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-offset-2"
                          >
                            Login
                          </button>
                        </div>
                      ) : cart && cart.products && cart.products.length > 0 ? (
                        cart.products.slice(0, 3).map((item, index) => {
                          const product = productsDetail.find(p => p.name); // Better product matching logic needed
                          if (!product) return null;
                          
                          return (
                            <div
                              key={`${item._id}-${index}`}
                              className="bg-white w-full flex space-x-[8px] cursor-pointer flex-row justify-between min-h-[75px] rounded-[5px] ring-[0.5px] ring-gray-800 items-center text-black p-[8px] mb-2 last:mb-0 hover:bg-gray-50 transition-colors"
                            >
                              <div className="h-[60px] w-[60px] flex-shrink-0 overflow-hidden flex items-center justify-center bg-[#fff] rounded-[5px]">
                                <Image 
                                  src={product.imageUrl} 
                                  width={50} 
                                  height={50} 
                                  alt={product.name}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1 leading-[16px] min-w-0">
                                <p className="text-[14px] lg:text-[16px] leading-[17px] truncate font-medium">
                                  {product.name}
                                </p>
                                <p className="text-[12px] lg:text-[13px] text-gray-600 truncate">
                                  {product.subtitle}
                                </p>
                                <p className="text-[12px] lg:text-[13px] font-medium">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-black px-[20px] py-[20px] text-center">
                          No products in the cart
                        </p>
                      )}
                    </div>
                    {userLoggedIn && cart && cart.products && cart.products.length > 0 && (
                      <button
                        onClick={() => router.push("/cart")}
                        className="text-black bg-[#FDAA1C] w-full py-[8px] flex items-center justify-center rounded-[5px] cursor-pointer mt-[8px] hover:bg-[#e6941a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-offset-2"
                      >
                        View All Products
                      </button>
                    )}
                  </div>
                )}

                {/* Mobile Cart Tooltip */}
                {isCartHoverOpen && !userLoggedIn && (
                  <div className="md:hidden absolute right-0 top-[45px] w-[250px] bg-[#F5F5F5] p-[10px] drop-shadow-lg rounded-[10px] ring-gray-800 ring-[0.5px] z-[110]">
                    <div className="flex flex-col items-center justify-center p-2">
                      <p className="text-black text-center leading-[18px] mb-3 text-sm">
                        Please login to add products to your cart
                      </p>
                      <button
                        onClick={() => router.push("/login")}
                        className="text-black bg-[#FDAA1C] w-full py-[6px] flex items-center justify-center rounded-[5px] cursor-pointer hover:bg-[#e6941a] transition-colors text-sm"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className={`md:hidden bg-white transition-all duration-300 overflow-hidden ${
            isMobileSearchOpen ? 'max-h-[120px] border-t border-gray-200' : 'max-h-0'
          }`}>
            <div className="p-4 space-y-3">
              {/* Category Select */}
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FDAA1C] focus:ring-2 focus:ring-[#FDAA1C] focus:ring-opacity-50 text-black bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Mobile product category"
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
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FDAA1C] focus:ring-2 focus:ring-[#FDAA1C] focus:ring-opacity-50 placeholder-gray-500 text-black"
                  placeholder="Search products..."
                  aria-label="Mobile search input"
                />
                <button
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  className="bg-[#FDAA1C] px-4 py-3 rounded-lg hover:bg-[#e6941a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Search"
                >
                  <Image src={SearchIcon} height={20} width={20} alt="" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Bottom Navigation */}
          <div className="hidden  md:flex rounded-b-[9px] flex-row items-center px-[20px] text-[14.5px] text-black bg-[#808080] space-x-[20px] w-full h-[40px]">
            <button
              onMouseEnter={handleCategoryMouseEnter}
              onMouseLeave={handleCategoryMouseLeave}
              className="flex flex-row cursor-pointer space-x-[4px] items-center hover:text-gray-200 transition-colors focus:outline-none  px-2 py-1"
              aria-expanded={onCategoryHover}
            >
              <Image
                alt=""
                src={Menu}
                width={19}
                height={15}
                className="h-[15px] w-[19px]"
              />
              <span>All Categories</span>
            </button>
            
            <button 
              onClick={() => router.push("/order-history")} 
              className="cursor-pointer hover:text-gray-200  transition-colors focus:outline-none px-2 py-1"
            >
              Order History
            </button>
            
            <button 
              onClick={() => router.push("/account")} 
              className="cursor-pointer hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded px-2 py-1"
            >
              Account Management
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden bg-white transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-[400px] border-t border-gray-200' : 'max-h-0'
          }`}>
            <div className="p-4 space-y-1">
              <button 
                className="w-full py-3 px-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3 text-left focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-opacity-50"
                onClick={() => {
                  setIsMobileCategoriesOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Image src={Menu} width={19} height={15} alt="" />
                <span>All Categories</span>
              </button>
              
              <button 
                className="w-full py-3 px-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-opacity-50"
                onClick={() => {
                  router.push("/order-history");
                  closeMobileMenus();
                }}
              >
                Order History
              </button>
              
              <button 
                className="w-full py-3 px-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-opacity-50"
                onClick={() => {
                  router.push("/account");
                  closeMobileMenus();
                }}
              >
                Account Management
              </button>

              {userLoggedIn ? (
                <div className="pt-2 border-t border-gray-200">
                  <LogoutButton />
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleNavLoginClick();
                      closeMobileMenus();
                    }}
                    className="w-full bg-[#FDAA1C] text-black py-3 rounded-lg hover:bg-[#e6941a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FDAA1C] focus:ring-offset-2"
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
          className={`${onCategoryHover ? "max-h-[72vh] opacity-100" : "max-h-0 opacity-0"} 
                      transition-all duration-300 
                      ring-[1px] ring-black
                      rounded-b-[20px]
                      overflow-hidden 
                      origin-top 
                      flex justify-center
                      hidden md:flex`}
        >
          <div
            onMouseEnter={handleCategoryMouseEnter}
            onMouseLeave={handleCategoryMouseLeave}
            className="bg-white w-[93vw] max-w-[1350px] overflow-hidden ring-[0.5px] text-black 
                      flex flex-row ring-gray-500 rounded-b-[20px] shadow-lg"
          >
            <div className="flex flex-col  w-full overflow-hidden items-center justify-center">
              <AllNavCategories />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;