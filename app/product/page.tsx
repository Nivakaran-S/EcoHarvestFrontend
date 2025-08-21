"use client";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import Image from "next/image";
import ProductImage2 from "../images/product.png";
import Star from "../images/log.png";
import Max from "../components/Max";
import Product from "../components/Product";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import StarRating from "../components/StarRating";

const BASE_URL = "https://eco-harvest-backend.vercel.app";


interface Product {
  name: string;
  subtitle: string;
  averageRating: number;
  numberOfReviews: number;
  unitPrice: number;
  MRP: number;
  statSubus: string;
}

interface Review {
  userName: string;
  rating: number;
  comment: string;
}

interface Cart {
  products: any[];
}

const ProductPage: React.FC = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || "";
  const discountPrice = searchParams.get("discountPrice");
  const discountPercentage = searchParams.get("discountPercentage");
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<Cart>({ products: [] });
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [productDetails, setProductDetails] = useState<Product[]>([]);
  const [product, setProduct] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<string>("");
  const [userRating, setUserRating] = useState<number>(0);
  const [numberOfCartItems, setNumberOfCartItems] = useState<number>(0);

  const router = useRouter();

  const handleReviewSubmit = async (): Promise<void> => {
    console.log("Submitting review:", userReview, id, productId, userRating);
    try {
      const response = await axios.post(`${BASE_URL}/reviews/`, {
        productId,
        userId: id,
        comment: userReview,
        rating: userRating,
      });
      console.log("Review submitted successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async (): Promise<void> => {
      try {
        const response = await axios.get<Product[]>(
          `${BASE_URL}/products/${productId}`
        );
        setProductDetails(response.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    const fetchReviews = async (): Promise<void> => {
      try {
        const response = await axios.get<Review[]>(
          `${BASE_URL}/reviews/${productId}`
        );
        setReviews(response.data);
        console.log("Reviews fetched successfully:", response.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [productId]);

  useEffect(() => {
    const fetchCookies = async (): Promise<void> => {
      try {
        const response = await axios.get<{
          id: string;
          role: string;
        }>(`${BASE_URL}/check-cookie/`, {
          withCredentials: true,
        });

        setId(response.data.id);
        setRole(response.data.role);

        if (response.data.role === "Customer" || response.data.role === "Company") {
          setUserLoggedIn(true);
          try {
            const response2 = await axios.get<{
              cart: Cart;
              products: any[];
            }>(`${BASE_URL}/cart/${response.data.id}`);
            setCart(response2.data.cart);
            setProduct(response2.data.products);
            setNumberOfCartItems(response2.data.cart.products.length);
            console.log("Length", response2.data.cart.products.length);
            console.log("Product items fetched successfully:", response2.data.products);
            console.log("Cart items fetched successfully:", response2.data.cart);
          } catch (err) {
            console.log("User not logged in:", err);
          }
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

  const handleIncreaseQuantity = (): void => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = (): void => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async (): Promise<void> => {
    try {
      if (!userLoggedIn) {
        router.push("/login");
        return;
      }

      const response = await axios.post<{
        success: boolean;
      }>(
        `${BASE_URL}/cart/`,
        {
          productId,
          userId: id,
          quantity,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("Product added to cart");
      } else {
        console.log("Error adding product to cart");
      }
      window.location.reload();
    } catch (err) {
      console.error("Error adding product to cart:", err);
    }
  };

  const handleAddToCart2 = async (): Promise<void> => {
    try {
      if (!userLoggedIn) {
        router.push("/login");
        return;
      }

      const response = await axios.post<{
        success: boolean;
      }>(
        `${BASE_URL}/cart/`,
        {
          productId,
          userId: id,
          quantity,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("Product added to cart");
      } else {
        console.log("Error adding product to cart");
      }
    } catch (err) {
      console.error("Error adding product to cart:", err);
    }
  };

  const handleBuyNow = async (): Promise<void> => {
    if (!userLoggedIn) {
      router.push("/login");
      return;
    }
    await handleAddToCart2();
    router.push("/cart");
  };

  return (
    <div>
      <Navigation
        numberOfCartItems={numberOfCartItems}
        productsDetail={product}
        cart={cart}
        id={id}
        userLoggedIn={userLoggedIn}
      />
      {productDetails.map((product, index) => (
        <div key={index} className="">
          <div className="text-black bg-[#F5F5F5] w-[100%] flex flex-col space-y-[10px] justify-center items-center">
            <div className="bg-gradient-to-b pt-[16vh] flex flex-col items-center justify-center from-gray-400 to-[#F5F5F5] h-[100%] w-[100%]">
              <div className="w-[94vw] flex flex-row justify-center items-center rounded-[15px] overflow-hidden">
                <div className="select-none w-[38.2%] ml-[10px] border-[0.5px] border-gray-500 rounded-[10px] bg-[#F5F5F5] h-[70vh] mb-[40px]">
                  {!!discountPercentage && (
                    <div className="drop-shadow-lg hover:drop-shadow-2xl rounded-[10px] flex flex-col items-center justify-between p-[10px]">
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[12px] px-3 py-[3px] rounded-bl-lg font-semibold shadow-md z-10">
                        -{discountPercentage}%
                      </div>
                    </div>
                  )}
                  <div className="leading-[25px] py-[20px] px-[25px]">
                    <p className="leading-[32px] text-[28px] w-[80%]">{product.name}</p>
                    <div className="flex relative flex-row items-center justify-between">
                      <div>
                        <p className="text-[20px] ml-[10px] text-orange-500">{product.subtitle}</p>
                        <div className="flex flex-row items-center mt-[10px] space-x-[3px]">
                          <StarRating rating={product.averageRating} onChange={() => {}} />
                          <p className="text-gray-700 flex items-center justify-center text-[13px]">
                            <span className="text-[15px]">{product.averageRating}</span>
                            ({product.numberOfReviews})
                          </p>
                        </div>
                      </div>
                      <div className="absolute text-black flex flex-col items-center top-[10px] right-[0px]">
                        <div className="rounded-full text-black ring-gray-800 ring-[0.5px] px-[15px] py-[0px] cursor-pointer bg-[#FDAA1C]">
                          <p className="text-[13px]">Ask Max</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <div className="mt-[20px]">
                        {discountPrice ? (
                          <>
                            <p className="text-[35px] mt-[5px]">Rs. {discountPrice}</p>
                            <p className="text-[15px] pl-[5px] text-gray-600">
                              <s>MRP: Rs. {product.unitPrice}</s>
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[35px] mt-[5px]">Rs. {product.unitPrice}</p>
                            <p className="text-[15px] pl-[5px] text-gray-600">
                              <s>MRP: Rs. {product.MRP}</s>
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-center leading-[20px]">
                        <p className="text-green-800 text-[19px]">{product.statSubus}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center my-[10px]">
                      <div className="bg-gray-500 h-[0.5px] w-[98%]"></div>
                    </div>
                    <div className="flex mx-[15px] flex-row items-center justify-between">
                      <div className="flex flex-row items-center justify-center space-x-[10px]">
                        <p className="text-[20px]">Quantity</p>
                        <div className="bg-white my-[10px] ring-[1px] ring-gray-400 h-[30px] mt-[10px] ml-[10px] w-[90px] rounded-[5px] flex flex-row items-center justify-center">
                          <div
                            onClick={handleDecreaseQuantity}
                            className="px-[10px] cursor-pointer h-[100%] flex items-center justify-center"
                          >
                            <div className="bg-black h-[1px] w-[10px]"></div>
                          </div>
                          <div className="w-[100%] flex items-center justify-center">
                            <input
                              value={quantity}
                              onChange={(e) =>
                                setQuantity(Math.max(1, Number(e.target.value) || 1))
                              }
                              className="w-[100%] text-[20px] text-center focus:outline-none"
                            />
                          </div>
                          <div onClick={handleIncreaseQuantity} className="px-[10px] cursor-pointer">
                            <p className="text-[20px]">+</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center my-[10px]">
                      <div className="bg-gray-500 h-[0.5px] w-[98%]"></div>
                    </div>
                    <div className="text-[15px] mt-[0px] mx-[10px] flex flex-col space-y-[8px] leading-[22px]">
                      <div className="flex text-[18px] flex-row items-center justify-between">
                        <p>Delivery</p>
                        <p>Colombo, Sri Lanka</p>
                      </div>
                      <div className="flex text-[18px] flex-row items-center justify-between">
                        <p>Sub Total</p>
                        {discountPrice ? (
                          <p>Rs. {quantity * Number(discountPrice)}</p>
                        ) : (
                          <p>Rs. {quantity * product.unitPrice}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-[8px] flex items-center justify-center mt-[15px]">
                      <div
                        onClick={handleAddToCart}
                        className="w-[100%] bg-[#FDAA1C] py-[5px] cursor-pointer rounded flex items-center justify-center"
                      >
                        <p>Add to Cart</p>
                      </div>
                      <div
                        onClick={handleBuyNow}
                        className="w-[100%] cursor-pointer bg-[#101010] text-white flex py-[5px] rounded items-center justify-center"
                      >
                        <p>Buy now</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[61.8%] flex flex-col space-y-[30px] items-center justify-center h-[83vh]">
                  <div className="w-[100%] relative h-[350px] flex flex-row justify-center items-end">
                    <Image alt="" src={ProductImage2} height={350} />
                    <div className="absolute text-black flex flex-col items-center right-[100px]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[94vw] pb-[50px] flex flex-col">
              <div className="bg-white py-[20px] px-[25px] ring-[0.5px] ring-gray-500 rounded-[15px] mt-[10px] w-[100%]">
                <p className="text-[25px]">Reviews & Ratings</p>
                <div className="w-[100%]">
                  <div className="flex space-x-[10px] py-[15px] pl-[20px] flex-row">
                    <div>
                      <p className="text-[130px] leading-[120px] text-[#FDAA1C]">
                        {product.averageRating}
                      </p>
                    </div>
                    <div className="flex flex-col leading-[20px] justify-center"></div>
                  </div>
                  <div className="flex flex-col pb-[18px] space-y-[10px]">
                    {reviews.map((review, index) => (
                      <div
                        key={index}
                        className="flex flex-col ring-gray-500 ring-[0.5px] p-[10px] space-y-[10px] w-[100%] h-[22vh] bg-gray-100 rounded-[10px]"
                      >
                        <div className="flex flex-row justify-between items-center px-[10px] py-[5px]">
                          <div className="flex flex-row items-center space-x-[8px]">
                            <div className="rounded-full bg-white ring-[0.5px] ring-gray-500 h-[40px] w-[40px]"></div>
                            <div className="flex flex-col leading-[21px]">
                              <p className="text-[19px]">{review.userName}</p>
                              <StarRating rating={review.rating} hoverStar={false} onChange={() => {}} />
                            </div>
                          </div>
                          <div className="flex flex-row items-center space-x-[5px]"></div>
                        </div>
                        <div className="ml-[10px]">
                          <p>{review.comment}</p>
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="px-[30px] flex flex-col items-center py-[10px]">
                        <p>No reviews for this product</p>
                        <p>Be the first to review this product</p>
                      </div>
                    )}
                    {userLoggedIn ? (
                      <div>
                        <div className="bg-white mt-[10px] flex flex-col ring-gray-500 ring-[0.5px] w-[100%] py-[15px] flex px-[25px] rounded-[10px]">
                          <p className="text-[20px]">Write a Review</p>
                          <StarRating
                            rating={userRating}
                            hoverStar={true}
                            onChange={(newRating: number) => {
                              setUserRating(newRating);
                            }}
                          />
                          <textarea
                            value={userReview}
                            onChange={(e) => setUserReview(e.target.value)}
                            className="ring-[0.5px] ring-gray-500 h-[100px] py-[10px] mt-[10px] rounded-[10px] focus:outline-none px-[20px]"
                            placeholder="Enter review"
                          />
                          <div
                            onClick={handleReviewSubmit}
                            className="bg-[#FDAA1C] cursor-pointer mt-[10px] w-[100%] py-[5px] flex items-center justify-center rounded-[5px]"
                          >
                            <p>Submit review</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-300 flex flex-col items-center py-[10px] rounded-[5px] mt-[10px]">
                        <p>Please Login to submit review</p>
                        <div
                          onClick={() => router.push("/login")}
                          className="bg-[#FDAA1C] px-[25px] cursor-pointer mt-[10px] w-fit py-[5px] flex items-center justify-center rounded-[5px]"
                        >
                          <p>Login</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Max />
          <Footer />
        </div>
      ))}
    </div>
  );
};

export default ProductPage;