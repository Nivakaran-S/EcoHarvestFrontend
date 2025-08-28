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

interface ProductProps {
  id: string;
  title: string;
  subtitle: string;
  unitPrice: number;
  imageUrl: string;
  discounts?: Discount[];
  averageRating?: number;   // dynamic rating
  reviewCount?: number;     // dynamic review count
}

const ProductCard: React.FC<ProductProps> = ({
  id,
  title,
  subtitle,
  unitPrice,
  imageUrl,
  discounts,
  averageRating = 0,
  reviewCount = 0,
}) => {
  const router = useRouter();

  // check if product has a discount
  const discount = discounts?.find(
    (discount) => discount.status && discount.productId?._id === id
  );

  const discountPrice = discount
    ? unitPrice * (1 - discount.percentage / 100)
    : null;

  const handleProductClick = () => {
    let url = `/product?productId=${encodeURIComponent(id)}`;
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
      className="relative bg-white cursor-pointer ring-gray-300 ring-[0.5px] drop-shadow-lg hover:drop-shadow-2xl rounded-[10px] flex flex-col items-center justify-between p-[10px] w-[14vw] mt-[10px] transition-all"
    >
      {/* Discount Badge */}
      {!!discount && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[12px] px-3 py-[3px] rounded-bl-lg font-semibold shadow-md z-10">
          -{discount.percentage}%
        </div>
      )}

      {/* Product Image */}
      <div className="py-[15px]">
        <Image
          src={imageUrl}
          className="select-none object-contain"
          alt="Product"
          width={145}
          height={145}
        />
      </div>

      {/* Product Info */}
      <div className="leading-[22px] select-none text-left w-full">
        <p className="text-[16px] leading-[21px] font-medium">{title}</p>
        <p className="text-[15px] px-[7px] leading-[17px] mb-[3px] text-[#E08E26]">
          {subtitle}
        </p>

        {/* Price */}
        <div>
          {!!discountPrice ? (
            <div className="text-[23px] mt-[5px]">
              <p className="line-through text-gray-400 text-[18px]">
                Rs. {unitPrice}
              </p>
              <p className="font-semibold">Rs. {discountPrice}</p>
            </div>
          ) : (
            <p className="text-[23px] mt-[5px] font-semibold">
              Rs. {unitPrice}
            </p>
          )}

          {/* Rating */}
          <div className="flex flex-row items-center space-x-[5px] mt-1">
            <Image src={Star} alt="Star" className="h-[15px] w-[15px]" />
            <p className="text-gray-700 text-[15px]">
              {averageRating.toFixed(1)} ({reviewCount})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
