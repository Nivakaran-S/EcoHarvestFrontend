import React from "react";
import Product from "./Product";

// Define interface for props (empty in this case as no props are passed)
interface TopSellersProps {}

const TopSellers: React.FC<TopSellersProps> = () => {
  return (
    <div className="text-black min-h-[100vh] bg-[#F5F5F5] flex items-center justify-center">
      <div className="w-[94vw] h-[100%]">
        <div className="py-[5px] w-fit flex items-center justify-center text-[22px] pl-[35px] pr-[40px] rounded-l-[5px] rounded-tr-[5px] rounded-br-[35px]">
          <p className="text-[40px] text-gray-800 select-none">Top Sellers</p>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-6 w-[95%] gap-[5px] pt-[15px] pb-[45px]">
            <Product
              id="1"
              title="Organic Apples"
              subtitle="Fresh and juicy"
              unitPrice={2.99}
              imageUrl="/images/apples.jpg"
            />
            <Product
              id="2"
              title="Bananas"
              subtitle="Sweet and ripe"
              unitPrice={1.49}
              imageUrl="/images/bananas.jpg"
            />
            <Product
              id="3"
              title="Carrots"
              subtitle="Crunchy and healthy"
              unitPrice={0.99}
              imageUrl="/images/carrots.jpg"
            />
            <Product
              id="4"
              title="Tomatoes"
              subtitle="Vine-ripened"
              unitPrice={2.49}
              imageUrl="/images/tomatoes.jpg"
            />
            <Product
              id="5"
              title="Broccoli"
              subtitle="Green and fresh"
              unitPrice={1.99}
              imageUrl="/images/broccoli.jpg"
            />
            <Product
              id="6"
              title="Strawberries"
              subtitle="Sweet and red"
              unitPrice={3.99}
              imageUrl="/images/strawberries.jpg"
            />
            <Product
              id="7"
              title="Potatoes"
              subtitle="Farm fresh"
              unitPrice={1.29}
              imageUrl="/images/potatoes.jpg"
            />
            <Product
              id="8"
              title="Spinach"
              subtitle="Leafy greens"
              unitPrice={2.19}
              imageUrl="/images/spinach.jpg"
            />
            <Product
              id="9"
              title="Oranges"
              subtitle="Citrus delight"
              unitPrice={2.79}
              imageUrl="/images/oranges.jpg"
            />
            <Product
              id="10"
              title="Cucumbers"
              subtitle="Cool and crisp"
              unitPrice={1.59}
              imageUrl="/images/cucumbers.jpg"
            />
            <Product
              id="11"
              title="Peppers"
              subtitle="Colorful and tasty"
              unitPrice={2.39}
              imageUrl="/images/peppers.jpg"
            />
            <Product
              id="12"
              title="Lettuce"
              subtitle="Fresh and crunchy"
              unitPrice={1.89}
              imageUrl="/images/lettuce.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSellers;