"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import PlaceholderImage from "../images/RiceGrainsNoodles.jpg";

const API_BASE_URL = "https://eco-harvest-backend.vercel.app";

interface ProductCategory {
  _id: string;
  name: string;
  imageUrl: string;
}

const AllCategories: React.FC = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackImages, setFallbackImages] = useState<{ [key: string]: string | StaticImageData }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ProductCategory[]>(`${API_BASE_URL}/productcategories`);
        setProductCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageError = (id: string) => {
    setFallbackImages((prev) => ({ ...prev, [id]: PlaceholderImage }));
  };

  const handleCategoryClick = (id: string, name: string) => {
    router.push(`/category?categoryId=${encodeURIComponent(id)}&categoryName=${encodeURIComponent(name)}`);
  };

  if (loading) {
    return (
      <div className="text-black bg-[#F5F5F5] flex items-center justify-center h-[100vh]">
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-black bg-[#F5F5F5] flex items-center justify-center h-[100vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="text-black bg-[#F5F5F5] flex items-center justify-center min-h-screen">
      <div className="w-[94vw]">
        <div className="py-[5px] w-fit flex items-center justify-center text-[22px] pl-[35px] pr-[80px] rounded-l-[5px] rounded-tr-[5px] rounded-br-[35px]">
          <p className="text-[40px] text-gray-800 select-none">All Categories</p>
        </div>

        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-[91%] gap-[15px] pt-[15px] pb-[45px]">
            {productCategories.map((category) => (
              <div
                key={category._id}
                onClick={() => handleCategoryClick(category._id, category.name)}
                className="flex flex-col cursor-pointer ring-[1px] items-center justify-center relative bg-red-500 rounded-[10px] h-[28vh] w-[28vh] transition duration-300 hover:scale-[105%] hover:shadow-2xl"
              >
                <Image
                  src={fallbackImages[category._id] || category.imageUrl || PlaceholderImage}
                  alt={category.name}
                  width={350}
                  height={350}
                  className="rounded-[10px] h-[100%] object-cover"
                  onError={() => handleImageError(category._id)}
                />
                <p className="absolute  px-3 py-1 text-center text-[23px] text-black leading-[27px] w-full h-[45%] flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  {category.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCategories;