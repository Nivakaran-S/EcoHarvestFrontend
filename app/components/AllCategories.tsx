"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image, { StaticImageData } from "next/image";

// Placeholder image import
import PlaceholderImage from '../images/RiceGrainsNoodles.jpg';

const API_BASE_URL = "https://eco-harvest-backend.vercel.app";

interface ProductCategory {
  _id: string;
  name: string;
  imageUrl: string;
}

const AllCategories: React.FC = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Accept both string (URL) or StaticImageData (imported images)
  const [fallbackImages, setFallbackImages] = useState<{ [key: string]: string | StaticImageData }>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ProductCategory[]>(`${API_BASE_URL}/productcategories/`);
        setProductCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageError = (id: string) => {
    setFallbackImages((prev) => ({ ...prev, [id]: PlaceholderImage }));
  };

  if (loading) {
    return (
      <div className="text-black bg-[#F5F5F5] flex items-center justify-center h-[100vh]">
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="text-black bg-[#F5F5F5] flex items-center justify-center">
      <div className="w-[94vw]">
        <div className="py-[5px] w-fit flex items-center justify-center text-[22px] pl-[35px] pr-[80px] rounded-l-[5px] rounded-tr-[5px] rounded-br-[35px]">
          <p className="text-[40px] text-gray-800 select-none">All Categories</p>
        </div>

        <div className="flex items-center justify-center">
          <div className="grid grid-cols-6 w-[95%] gap-[5px] pt-[15px] pb-[45px]">
            {productCategories.map((category) => (
              <div key={category._id} className="flex flex-col items-center">
                <Image
                  src={fallbackImages[category._id] || category.imageUrl || PlaceholderImage}
                  alt={category.name}
                  width={150}
                  height={150}
                  className="rounded-[10px] object-cover"
                  onError={() => handleImageError(category._id)}
                />
                <p className="mt-2 text-center">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCategories;
