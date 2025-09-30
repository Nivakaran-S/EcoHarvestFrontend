'use client';
import React, { useState, useEffect } from 'react';
import ANavCategory from './ANavCategory';
import Image from 'next/image';
import axios from 'axios';

// Import static images
import mainMealsWallpaper from '../images/mainMealsWallpaper.jpg';
import bakedFood from '../images/backedFood.jpg';
import sideDishes from '../images/sideDishes.jpg';
import meatSeaFood from '../images/meatAndSeaFood.jpg';
import dairyProducts from '../images/Desserts.jpg';
import riceAndGrains from '../images/RiceGrainsNoodles.jpg';
import Beverages from '../images/beverages.jpg';
import Sauces from '../images/Sauces.jpg';

// Interface for backend categories
interface ProductCategory {
  _id: string;
  name: string;
  imageUrl: string;
}

// Map category names to static images
const categoryImageMap: Record<string, any> = {
  'Meals & Main Courses': mainMealsWallpaper,
  'Baked Goods & Pastries': bakedFood,
  'Appetizer & Side Dishes': sideDishes,
  'Meat & Seafood': meatSeaFood,
  'Dairy Products & Desserts': dairyProducts,
  'Rice, Grains & Noodles': riceAndGrains,
  'Beverages': Beverages,
  'Fruits & Vegetables': bakedFood, // placeholder
  'Sauces, Condiments & Seasonings': Sauces,
};

const AllNavCategories: React.FC = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [navCategorySelect, setNavCategorySelect] = useState<string>('Meals & Main Courses');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ProductCategory[]>(
          'https://eco-harvest-backend.vercel.app/productcategories/'
        );
        setProductCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex w-full  sm:h-[500px] bg-white shadow-md rounded-b-2xl overflow-hidden">
      {/* Category list */}
      <div className="flex flex-col  sm:w-1/2 bg-gray-50 sm:border-r overflow-y-auto">
        {loading ? (
          <div className="p-4 text-gray-500">Loading categories…</div>
        ) : (
          productCategories.map((category) => (
            <ANavCategory
              key={category._id}
              onMouseEnter={() => setNavCategorySelect(category.name)}
              title={category.name}
              id={category._id}
              image={category.imageUrl}
            />
          ))
        )}
      </div>

      {/* Preview panel */}
      <div className="relative hidden sm:flex w-1/2 h-full">
        {categoryImageMap[navCategorySelect] ? (
          <Image
            src={categoryImageMap[navCategorySelect]}
            alt={navCategorySelect}
            fill
            className="object-cover transition-transform duration-500 ease-in-out hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            No preview available
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
          <h2 className="text-lg font-semibold text-white">{navCategorySelect}</h2>
        </div>
      </div>
    </div>
  );
};

export default AllNavCategories;
