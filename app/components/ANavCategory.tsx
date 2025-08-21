import Image from 'next/image';
import ProductImage from '../images/product.png';
import Start from '../images/log.png';
import Tea from '../images/teaAndCoffee2.png';
import { useRouter } from 'next/navigation';

// Define interface for props
interface ANavCategoryProps {
  title: string;
  id: string;
  image: string;
  onMouseEnter: () => void;
}

const ANavCategory: React.FC<ANavCategoryProps> = ({ title, id, image, onMouseEnter }) => {
  const router = useRouter();

  const handleCategoryClick = () => {
    router.push(`/category?categoryId=${encodeURIComponent(id)}&categoryName=${encodeURIComponent(title)}`);
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onClick={handleCategoryClick}
      className='bg-white border-t-[1px] border-gray-400 text-black cursor-pointer px-[40px] h-[100%] flex items-center'
    >
      <p className='text-[18px]'>{title}</p>
    </div>
  );
};

export default ANavCategory;