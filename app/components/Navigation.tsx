"use client";

import Image from "next/image";
import Cart from "../images/cartLogo2.png";
import Menu from "../images/menu.png";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import LogoutButton from "./Logout";
import AllNavCategories from "./AllNavCategories";
import SearchIcon from '../images/search-icon.png';
import mainMealsWallpaper from '../images/mainMealsWallpaper.jpg';
import bakedFood from '../images/backedFood.jpg';
import sideDishes from '../images/sideDishes.jpg';
import meatSeaFood from '../images/meatAndSeaFood.jpg';
import dairyProducts from '../images/Desserts.jpg';
import riceAndGrains from '../images/RiceGrainsNoodles.jpg';
import Beverages from '../images/beverages.jpg';
import Sauces from '../images/Sauces.jpg';
import EcoHarvest from '../images/ecoHarvestNavLogo2.png';

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

const Navigation: React.FC<NavigationProps> = ({ id, productsDetail, userLoggedIn, cart, numberOfCartItems }) => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownWidth, setDropdownWidth] = useState<string>("auto");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [customerId, setCustomerId] = useState<string | undefined>(id);
  const [query, setQuery] = useState<string>("");
  const [onCategoryHover, setOnCategoryHover] = useState<boolean>(false);
  const [navCategorySelect, setNavCategorySelect] = useState<string>('Meals & Main Courses');
  const [NumCartItems, setNumCartItems] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (textRefs.current.length > 0) {
      const maxWidth = Math.max(...textRefs.current.map(el => el?.offsetWidth || 0));
      setDropdownWidth(`${maxWidth + 40}px`);
    }
  }, [productCategories]);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ProductCategory[]>("http://localhost:8000/productcategories/");
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
    return () => { isMounted = false; };
  }, []);

  const handleNavLoginClick = () => {
    router.push("/login");
  };

  const handleSearch = async () => {
    try {
      if (query) {
        router.push(`/search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center fixed z-[100] w-full items-center">
      <nav className="bg-white w-[95vw] drop-shadow-md ring-gray-600 ring-[0.5px] mt-[5px] h-[14vh] rounded-[10px]">
        <div className="flex px-[30px] rounded-t-[10px] space-x-[10px] text-white bg-[#0A0A0A] justify-between items-center h-[67%]">
          <div className="cursor-pointer" onClick={() => router.push("/")}>
            <Image height={60} src={EcoHarvest} alt="EcoHarvest Logo" />
          </div>
          
          <div className="flex flex-row ml-[10px] w-full">
            {/* Hidden width measurement elements */}
            <div className="absolute invisible">
              {productCategories.map((category, index) => (
                <span
                  key={category._id}
                  ref={el => { textRefs.current[index] = el; }}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </span>
              ))}
            </div>

            {/* Categories dropdown */}
            <div
              className="bg-[#E6E6E6] border border-r-gray-400 h-[5.6vh] flex items-center justify-center rounded-l-[5px]"
              style={{ width: dropdownWidth }}
            >
              <select
                className="focus:outline-none bg-transparent text-[15px] h-full cursor-pointer pl-[10px] mr-[5px] text-black w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {loading ? (
                  <option disabled>Loading categories...</option>
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
            <div className="bg-white flex flex-row w-full items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="placeholder-gray-600 focus:outline-none w-full px-[18px] py-[5px] text-black"
                placeholder="Search Anything"
              />
            </div>

            <div onClick={handleSearch} className="bg-[#FDAA1C] flex items-center justify-center cursor-pointer h-[5.6vh] w-[8vh] rounded-r-[5px]">
              <Image src={SearchIcon} height={20} width={20} alt="Search Icon" />
            </div>
          </div>

          {/* Login section */}
          {!userLoggedIn ? (
            <div className="flex flex-col items-center justify-center leading-[18px] pl-[10px]">
              <p className="text-[12px]">Hello!</p>
              <div
                className="bg-[#FDAA1C] cursor-pointer text-black px-[14px] py-[3px] text-[13px] rounded-full flex items-center justify-center"
                onClick={handleNavLoginClick}
              >
                <p>Login</p>
              </div>
            </div>
          ) : (
            <LogoutButton />
          )}

          {/* Cart section */}
          <div className="relative group">
            <Image
              className="cursor-pointer"
              src={Cart}
              alt="Cart"
              width={60}
              height={60}
            />
            <p className="text-[#FFCC29] absolute top-[-19.5px] font-bold right-[11px] text-[33px]">{numberOfCartItems}</p>
            <div className="w-[50vh] bg-[#F5F5F5] hidden group-hover:block p-[10px] absolute right-[2%] top-[6.4vh] drop-shadow-sm rounded-[10px] ring-gray-800 ring-[0.5px]">
              {cart && cart.products && cart.products.length > 0 ? (
                cart.products.map((item) =>
                  productsDetail.map((product) => (
                    <div
                      key={item._id}
                      className="bg-white w-full flex space-x-[5px] cursor-pointer flex-row justify-between h-[75px] rounded-[5px] ring-[0.5px] ring-gray-800 items-center text-black p-[5px]"
                    >
                      <div className="h-[65px] w-[24%] overflow-hidden flex items-center justify-center bg-[#fff] rounded-[5px]">
                        <Image src={product.imageUrl} width={50} height={50} alt="product" />
                      </div>
                      <div className="w-[76%] leading-[16px]">
                        <p className="text-[16px] px-[5px] leading-[17px]">
                          {product.name}
                        </p>
                        <p className="text-[13px] ml-[5px]">{product.subtitle}</p>
                        <p className="text-[13px] px-[5px]">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))
                )
              ) : userLoggedIn ? (
                <p className="text-black px-[20px] py-[10px]">No products in the cart</p>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <p className="text-black w-[90%] text-center leading-[20px]">
                    Please login to add products to your cart
                  </p>
                  <div
                    onClick={() => router.push("/login")}
                    className="text-black bg-[#FDAA1C] w-full py-[4px] flex items-center justify-center rounded-[5px] cursor-pointer mt-[8px]"
                  >
                    <p>Login</p>
                  </div>
                </div>
              )}
              {userLoggedIn && (
                <div
                  onClick={() => router.push("/cart")}
                  className="text-black bg-[#FDAA1C] w-full py-[4px] flex items-center justify-center rounded-[5px] cursor-pointer mt-[8px]"
                >
                  <p className="select-none">View All Products</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex rounded-b-[9px] flex-row items-center px-[20px] text-[14.5px] text-black space-x-[20px] w-full h-[33%] bg-[#808080]">
          <div
            onMouseEnter={() => setOnCategoryHover(true)}
            onMouseLeave={() => setOnCategoryHover(false)}
            className="flex flex-row cursor-pointer space-x-[4px] items-center"
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
          
          <div onClick={() => router.push('/order-history')} className="cursor-pointer">
            <p>Order History</p>
          </div>
          
          <div onClick={() => router.push('/account')} className="cursor-pointer">
            <p>Account Management</p>
          </div>
        </div>
        
        <div
          className={`${onCategoryHover ? 'max-h-[72vh]' : 'max-h-0'} 
                      transition-all duration-500 
                      overflow-hidden 
                      origin-top 
                      flex justify-center`}
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
      </nav>
    </div>
  );
};

export default Navigation;