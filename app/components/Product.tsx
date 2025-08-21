"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Start from "../images/log.png";

// Define interfaces for props
interface Discount {
  status: boolean;
  productId: { _id: string };
  percentage: number;
}

interface ProductProps {
  title: string;
  id: string;
  subtitle: string;
  unitPrice: number;
  imageUrl: string;
  discounts?: Discount[];
}

const Product: React.FC<ProductProps> = ({ title, id, subtitle, unitPrice, imageUrl, discounts }) => {
  const router = useRouter();

  const discount = discounts?.find(
    (discount) => discount.status && discount.productId?._id === id
  );

  const discountPrice = discount
    ? unitPrice * (1 - discount.percentage / 100)
    : null;

  console.log("discount", discount);

  const handleProductClick = () => {
    let url = `/product?productId=${encodeURIComponent(id)}`;
    if (discountPrice) {
      url += `&discountPrice=${discountPrice}&discountPercentage=${discount?.percentage ?? ""}`;
    }
    router.push(url);
  };

  return (
    <div
      onClick={handleProductClick}
      className="bg-white cursor-pointer ring-gray-500 ring-[0.5px] drop-shadow-lg hover:drop-shadow-2xl rounded-[10px] flex flex-col items-center justify-between p-[10px] w-[14vw] mt-[10px]"
    >
      {!!discount && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[12px] px-3 py-[3px] rounded-bl-lg font-semibold shadow-md z-10">
          -{discount.percentage}%
        </div>
      )}
      <div className="py-[15px]">
        <Image
          src={imageUrl}
          className="select-none"
          alt="Product"
          width={145}
          height={145}
        />
      </div>

      <div className="leading-[22px] select-none text-left w-full">
        <p className="text-[16px] leading-[21px]">{title}</p>
        <p className="text-[15px] px-[7px] leading-[17px] mb-[3px] text-[#E08E26]">
          {subtitle}
        </p>

        <div>
          {!!discountPrice ? (
            <div className="text-[23px] mt-[5px]">
              <p className="line-through text-gray-400 text-[18px]">
                Rs. {unitPrice}
              </p>
              <p>Rs. {discountPrice}</p>
            </div>
          ) : (
            <p className="text-[23px] mt-[5px]">Rs. {unitPrice}</p>
          )}
          <div className="flex flex-row items-end space-x-[3px] mt-1">
            <Image src={Start} alt="Star" className="h-[15px] w-[15px]" />
            <p className="text-gray-700 text-[15px]">4.5(25)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;