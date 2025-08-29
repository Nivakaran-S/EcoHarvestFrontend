import Image, {StaticImageData} from 'next/image';
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  percentage?: string | number;
  imageSrc?: string | StaticImageData;
}

const Card: React.FC<CardProps> = ({ title, value, percentage, imageSrc }) => {
  // Determine if percentage is positive or negative for styling
  const isPositive = percentage && percentage.toString().includes('+');
  const isNegative = percentage && percentage.toString().includes('-');
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
          {percentage && (
            <div className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 
              isNegative ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {percentage}
            </div>
          )}
        </div>
        {imageSrc && (
          <div className="ml-4">
            <Image
              src={imageSrc}
              alt={title}
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;