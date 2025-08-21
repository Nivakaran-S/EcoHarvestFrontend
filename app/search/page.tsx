'use client';
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import Product from "../components/Product";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Star from '../images/log.png';
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSearchParams } from "next/navigation";

// Base URL for API requests
const BASE_URL = "https://eco-harvest-backend.vercel.app";

// Define interfaces for product and cart
interface ProductData {
  _id: string;
  name: string;
  imageUrl: string;
  subtitle: string;
  unitPrice: number;
}

interface CartItem {
  _id: string;
  quantity: number;
}

interface Cart {
  products: CartItem[];
}

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryName = searchParams.get('category') || '';
  const query = searchParams.get('query') || '';

  const [width, setWidth] = useState<number>(0);
  const selectRef = useRef<HTMLSelectElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [id, setId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<Cart>({ products: [] });
  const router = useRouter();
  const [searchProducts, setSearchProducts] = useState<ProductData[]>([]);
  const [productCount, setProductCount] = useState<number>(0);

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get<{ id: string; role: string }>(`${BASE_URL}/check-cookie/`, {
          withCredentials: true,
        });

        setId(response.data.id);
        setRole(response.data.role);

        if (response.data.role === 'Customer') {
          setUserLoggedIn(true);
          try {
            const response2 = await axios.get<Cart>(`${BASE_URL}/cart/${response.data.id}`);
            setCart(response2.data);
            console.log("Cart items fetched successfully:", response2.data);
          } catch (err) {
            console.error("Error fetching cart items:", err);
          }
        } else if (response.data.role === 'Vendor') {
          router.push('/vendor');
        } else if (response.data.role === 'Admin') {
          router.push('/admin');
        }
      } catch (error) {
        setUserLoggedIn(false);
      }
    };

    fetchCookies();
  }, [router]);

  const updateWidth = () => {
    if (selectRef.current && textRef.current) {
      const selectedText = selectRef.current.options[selectRef.current.selectedIndex].text;
      textRef.current.innerText = selectedText;
      setWidth(textRef.current.offsetWidth + 20);
    }
  };

  useEffect(() => {
    const handleSearch = async () => {
      try {
        const categoryNe = categoryName === 'All Categories' ? '' : categoryName;
        console.log("Searching for products with query:", query, "and category:", categoryNe);
        const response = await axios.post<ProductData[]>(`${BASE_URL}/products/search`, {
          searchTerm: query,
          categoryN: categoryNe,
        });
        setSearchProducts(response.data);
        setProductCount(response.data.length);
      } catch (err) {
        console.error("Error searching products:", err);
      }
    };

    handleSearch();
  }, [categoryName, query]);

  useEffect(() => {
    updateWidth();
  }, []);

  return (
    <div>
      <Navigation cart={cart} id={id} userLoggedIn={userLoggedIn} productsDetail={[]} numberOfCartItems={cart.products.length} />
      <div className="pt-[15vh] w-[100%] flex items-center justify-center text-black">
        <div className="w-[95%] h-[100%] flex flex-row py-[15px]">
          <div className="w-[16%] h-[100%]">
            <div className="flex text-[15px] flex-col leading-[20px]">
              <div className="fixed">
                <p className="text-[18px] text-gray-800">Category</p>
                <div className="flex pl-[5px] pb-[10px] pt-[2px] flex-col leading-[20px]">
                  <div className="flex flex-row">
                    <p className="cursor-pointer hover:text-gray-500">All Categories</p>
                  </div>
                  <div className="flex flex-row">
                    <p className="text-[#FDAA1C] cursor-pointer">Daily Grocery</p>
                  </div>
                  <div className="flex flex-row">
                    <p className="cursor-pointer hover:text-gray-500">Drinks</p>
                  </div>
                  <div className="flex flex-row">
                    <p className="cursor-pointer hover:text-gray-500">Tea and Coffee</p>
                  </div>
                </div>

                <div className="flex text-[15px] flex-col leading-[20px]">
                  <p className="text-[18px] text-gray-800">Flavour</p>
                  <div className="flex pl-[5px] pb-[10px] pt-[2px] flex-col leading-[20px]">
                    <div className="flex flex-row space-x-[2px]">
                      <input className="cursor-pointer accent-[#FDAA1C]" type="checkbox" />
                      <p>Mango Passion</p>
                    </div>
                    <div className="flex flex-row space-x-[2px]">
                      <input className="cursor-pointer accent-[#FDAA1C]" type="checkbox" />
                      <p>Mango Passion</p>
                    </div>
                    <div className="flex flex-row space-x-[2px]">
                      <input className="cursor-pointer accent-[#FDAA1C]" type="checkbox" />
                      <p>Mango Passion</p>
                    </div>
                    <div className="flex flex-row space-x-[2px]">
                      <input className="cursor-pointer accent-[#FDAA1C]" type="checkbox" />
                      <p>Mango Passion</p>
                    </div>
                  </div>
                </div>

                <div className="pb-[10px]">
                  <p>Price</p>
                  <div>
                    <input className="w-[150%] accent-[#FDAA1C] h-[5px] focus:outline-none cursor-pointer" type="range" />
                    <div className="flex flex-row justify-between w-[150%] text-[13px]">
                      <p>Rs. 0</p>
                      <p>Rs.500</p>
                    </div>
                  </div>
                </div>

                <div className="flex text-[15px] flex-col leading-[20px]">
                  <p className="text-[17px]">Brands</p>
                  <div className="flex pl-[5px] pb-[10px] pt-[2px] flex-col leading-[20px]">
                    <div className="flex flex-row space-x-[2px]">
                      <input className="cursor-pointer" type="checkbox" />
                      <p>Anchor</p>
                    </div>
                    <div className="flex flex-row space-x-[2px]">
                      <input className="cursor-pointer" type="checkbox" />
                      <p>Nestle</p>
                    </div>
                    <div className="flex flex-row space-x-[2px]">
                      <input className="cursor-pointer" type="checkbox" />
                      <p>Ambewela</p>
                    </div>
                    <div className="flex flex-row space-x-[2px]">
                      <input className="cursor-pointer" type="checkbox" />
                      <p>Elephant house</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p>Customer Reviews</p>
                  <div className="flex flex-row space-x-[3px]">
                    <Image className="cursor-pointer" alt="star" src={Star} height={15} />
                    <Image className="cursor-pointer" alt="star" src={Star} height={15} />
                    <Image className="cursor-pointer" alt="star" src={Star} height={15} />
                    <Image className="cursor-pointer" alt="star" src={Star} height={15} />
                    <Image className="cursor-pointer" alt="star" src={Star} height={15} />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[84%] min-h-[100vh] border-l-[1px] border-gray-600 px-[20px]">
              <div className="bg-gray-200 flex flex-row justify-between items-center rounded-[5px] text-[15px] py-[5px] my-[5px] ring-[0.5px] ring-gray-600 px-[10px]">
                <p>Found {productCount} results for "{query}"</p>
                <div className="flex flex-row text-[13px] items-center">
                  <p>Sort by: </p>
                  <div className="relative">
                    <span ref={textRef} className="absolute right-0 opacity-0 pointer-events-none z-[20] whitespace-nowrap">
                      Featured
                    </span>
                    <select
                      ref={selectRef}
                      onChange={updateWidth}
                      style={{ width }}
                      className="focus:outline-none z-[30] cursor-pointer bg-transparent border-none"
                    >
                      <option>Featured</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Highly Rated</option>
                      <option>Most Popular</option>
                      <option>Newest Arrivals</option>
                      <option>Best Sellers</option>
                    </select>
                  </div>
                </div>
              </div>
              <p className="text-[30px]">Search results for "{query}"</p>
              <div className="w-[100%] px-[5px] mx-[10px] flex items-center justify-center">
                <div className="grid w-[100%] gap-[5px] grid-cols-5">
                  {searchProducts.map((product, index) => (
                    <div key={index}>
                      <Product
                        id={product._id}
                        title={product.name}
                        imageUrl={product.imageUrl}
                        subtitle={product.subtitle}
                        unitPrice={product.unitPrice}
                        discounts={[]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Max />
        <Footer />
      </div>
    </div>
    );
};

export default SearchPage;