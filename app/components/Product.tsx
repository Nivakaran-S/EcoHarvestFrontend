"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Star from "../images/log.png";

// Define interfaces for props
interface Discount {
  status: boolean;
  productId: { _id: string };
  percentage: number;
}

// Updated interface to match the API response structure
interface ProductProps {
  // Support both _id and id for flexibility
  id?: string;
  _id?: string;
  title?: string;
  name?: string; // API uses 'name' instead of 'title'
  subtitle: string;
  unitPrice: number;
  MRP?: number; // Added MRP from API
  imageUrl: string;
  discounts?: Discount[];
  averageRating?: number;
  numberOfReviews?: number; // API uses 'numberOfReviews' instead of 'reviewCount'
  reviewCount?: number; // Keep for backward compatibility
  status?: string; // Added status from API
  quantity?: number; // Added quantity from API
}

const ProductCard: React.FC<ProductProps> = ({
  id,
  _id,
  title,
  name,
  subtitle,
  unitPrice,
  MRP,
  imageUrl,
  discounts,
  averageRating = 0,
  numberOfReviews,
  reviewCount,
  status,
  quantity,
}) => {
  const router = useRouter();

  // Get the actual product ID (support both _id and id)
  const productId = id || _id;
  
  // Get the actual product name (support both name and title)
  const productName = name || title;
  
  // Get the actual review count (prioritize numberOfReviews from API)
  const actualReviewCount = numberOfReviews ?? reviewCount ?? 0;

  // Validate required props
  if (!productId || !productName || !unitPrice) {
    console.warn('ProductCard: Missing required props', { productId, productName, unitPrice });
    return null; // Don't render if essential data is missing
  }

  // Check if product has a discount
  const discount = discounts?.find(
    (discount) => discount.status && discount.productId?._id === productId
  );

  const discountPrice = discount
    ? Math.round(unitPrice * (1 - discount.percentage / 100))
    : null;

  // Check if product is out of stock
  const isOutOfStock = status === "Out of Stock" || quantity === 0;

  const handleProductClick = () => {
    if (isOutOfStock) {
      // Optionally prevent clicking on out of stock items
      return;
    }

    let url = `/product?productId=${encodeURIComponent(productId)}`;
    if (discountPrice) {
      url += `&discountPrice=${discountPrice}&discountPercentage=${
        discount?.percentage ?? ""
      }`;
    }
    router.push(url);
  };

  return (
    <div
      onClick={handleProductClick}
      className={`relative bg-white ring-gray-300 ring-[0.5px] drop-shadow-lg rounded-[10px] flex flex-col items-center justify-between p-[10px] w-[14vw] mt-[10px] transition-all ${
        isOutOfStock 
          ? 'opacity-60 cursor-not-allowed' 
          : 'cursor-pointer hover:drop-shadow-2xl hover:scale-105'
      }`}
    >
      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-[10px] flex items-center justify-center z-20">
          <span className="text-white font-bold text-lg bg-red-600 px-3 py-1 rounded">
            OUT OF STOCK
          </span>
        </div>
      )}

      {/* Discount Badge */}
      {!!discount && !isOutOfStock && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[12px] px-3 py-[3px] rounded-bl-lg font-semibold shadow-md z-10">
          -{discount.percentage}%
        </div>
      )}

      {/* Product Image */}
      <div className="py-[15px] relative">
        <Image
          src={imageUrl}
          className="select-none object-contain"
          alt={`${productName} - ${subtitle}`}
          width={145}
          height={145}
          onError={(e) => {
            console.warn(`Failed to load image for product ${productId}:`, imageUrl);
            // You can set a fallback image here if needed
            // e.currentTarget.src = '/path/to/fallback-image.png';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="leading-[22px] select-none text-left w-full">
        {/* Product Name */}
        <p className="text-[16px] leading-[21px] font-medium line-clamp-2 min-h-[42px]">
          {productName}
        </p>
        
        {/* Product Subtitle */}
        <p className="text-[15px] px-[7px] leading-[17px] mb-[3px] text-[#E08E26] line-clamp-1">
          {subtitle}
        </p>

        {/* Price Section */}
        <div>
          {!!discountPrice ? (
            <div className="text-[23px] mt-[5px]">
              <p className="line-through text-gray-400 text-[16px]">
                Rs. {unitPrice}
              </p>
              <p className="font-semibold text-green-600">
                Rs. {discountPrice}
              </p>
              {MRP && MRP > unitPrice && (
                <p className="line-through text-gray-300 text-[14px]">
                  MRP: Rs. {MRP}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-[23px] mt-[5px] font-semibold">
                Rs. {unitPrice}
              </p>
              {MRP && MRP > unitPrice && (
                <p className="line-through text-gray-400 text-[16px]">
                  MRP: Rs. {MRP}
                </p>
              )}
            </div>
          )}

          {/* Rating Section */}
          <div className="flex flex-row items-center space-x-[5px] mt-1">
            <Image src={Star} alt="Star" className="h-[15px] w-[15px]" />
            <p className="text-gray-700 text-[15px]">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"} ({actualReviewCount})
            </p>
          </div>

          {/* Stock Status */}
          {status && (
            <div className="mt-1">
              <p className={`text-[13px] font-medium ${
                status === "In Stock" 
                  ? "text-green-600" 
                  : status === "Low Stock" 
                  ? "text-orange-500" 
                  : "text-red-500"
              }`}>
                {status}
                {quantity !== undefined && status === "In Stock" && (
                  <span className="text-gray-500"> ({quantity} available)</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;