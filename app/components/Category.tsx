"use client";
import Image from "next/image";
import ProductImage from "../images/product.png";
import Start from "../images/log.png";
import Tea from "../images/teaAndCoffee2.png";
import { useRouter } from "next/navigation";

// Define interface for props
interface CategoryProps {
  title: string;
  id: string;
  image: string;
}

const Category: React.FC<CategoryProps> = ({ title, id, image }) => {
  const router = useRouter();

  const handleCategoryClick = () => {
    router.push(
      `/category?categoryId=${encodeURIComponent(
        id
      )}&categoryName=${encodeURIComponent(title)}`
    );
  };

  return (
    <div
      onClick={handleCategoryClick}
      className="bg-white hover:scale-[105%] transition-transform duration-300 cursor-pointer relative ring-gray-500 ring-[0.5px] drop-shadow-lg hover:drop-shadow-2xl rounded-[10px] flex flex-col items-center justify-center w-[14vw] h-[14vw] mt-[10px]"
    >
      <div className="h-[14vw] w-[14vw] overflow-hidden rounded-[10px]">
        <Image
          width={500}
          height={500}
          src={image}
          className="select-none object-cover h-[100%] w-[100%]"
          alt="Product"
        />
      </div>
      <div className="absolute bg-white py-[5px] w-[100%]">
        <p className="text-[20px]  px-[20px] text-center select-none leading-[25px]">
          {title}
        </p>
      </div>
    </div>
  );
};

export default Category;