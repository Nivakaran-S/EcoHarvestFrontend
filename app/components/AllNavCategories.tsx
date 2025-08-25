'use client';
import React from 'react';
import ANavCategory from './ANavCategory';
import Bakery from '../images/bakeryFoodAndPastries.jpg';
import Rice from '../images/RiceGrainsNoodles.jpg';
import SideDishes from '../images/sideDishes.jpg';
import Desserts from '../images/Desserts.jpg';
import MainCourses from '../images/maincourses.jpg';
import Meat from '../images/meatAndSeaFood.jpg';
import RecycleProduct from '../images/recycleProduct.jpg';
import mainMealsWallpaper from '../images/mainMealsWallpaper.jpg';
import bakedFood from '../images/backedFood.jpg';
import sideDishes from '../images/sideDishes.jpg';
import meatSeaFood from '../images/meatAndSeaFood.jpg';
import dairyProducts from '../images/Desserts.jpg';
import riceAndGrains from '../images/RiceGrainsNoodles.jpg';
import Beverages from '../images/beverages.jpg';
import Sauces from '../images/Sauces.jpg';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Define interface for product category
interface ProductCategory {
  _id: string;
  name: string;
  imageUrl: string;
}

const AllNavCategories: React.FC = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [navCategorySelect, setNavCategorySelect] = useState<string>('Meals & Main Courses');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ProductCategory[]>("https://eco-harvest-backend.vercel.app/productcategories/");
        setProductCategories(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryHover = (val: string) => {
    setNavCategorySelect(val);
    console.log('mouse entered', val);
  };

  return (
    <div className="flex flex-row w-[100%] h-[100%]">
      <div className="flex flex-col w-[50%]">
        {productCategories.map((category) => (
          <ANavCategory
            onMouseEnter={() => handleCategoryHover(category.name)}
            key={category._id}
            title={category.name}
            id={category._id}
            image={category.imageUrl}
          />
        ))}
      </div>

      <div className="w-[100%] h-[100%] overflow-hidden">
        {navCategorySelect === 'Meals & Main Courses' && (
          <Image className="flex translate-y-[-10%]" src={mainMealsWallpaper} alt="Meals & Main Courses" />
        )}
        {navCategorySelect === 'Baked Goods & Pastries' && (
          <Image className="flex translate-y-[-20%] h-[140%] w-[100%]" src={bakedFood} alt="Baked Goods & Pastries" />
        )}
        {navCategorySelect === 'Appetizer & Side Dishes' && (
          <Image className="flex translate-y-[-35%] h-[350%] w-[100%]" src={sideDishes} alt="Appetizer & Side Dishes" />
        )}
        {navCategorySelect === 'Meat & Seafood' && (
          <Image className="flex translate-y-[-20%] h-[140%] w-[100%]" src={meatSeaFood} alt="Meat & Seafood" />
        )}
        {navCategorySelect === 'Dairy Products & Desserts' && (
          <Image className="flex translate-y-[-20%] h-[140%] w-[100%]" src={dairyProducts} alt="Dairy Products & Desserts" />
        )}
        {navCategorySelect === 'Rice, Grains & Noodles' && (
          <Image className="flex translate-y-[-20%] h-[140%] w-[100%]" src={riceAndGrains} alt="Rice, Grains & Noodles" />
        )}
        {navCategorySelect === 'Beverages' && (
          <Image className="flex translate-y-[-20%] h-[140%] w-[100%]" src={Beverages} alt="Beverages" />
        )}
        {navCategorySelect === 'Fruits & Vegetables' && (
          <Image className="flex translate-y-[-20%] h-[140%] w-[100%]" src={bakedFood} alt="Fruits & Vegetables" />
        )}
        {navCategorySelect === 'Sauces, Condiments & Seasonings' && (
          <Image className="flex translate-y-[-20%] h-[140%] w-[100%]" src={Sauces} alt="Sauces, Condiments & Seasonings" />
        )}
      </div>
    </div>
  );
};

export default AllNavCategories;