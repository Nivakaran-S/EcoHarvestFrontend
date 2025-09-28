'use client';
import Image from 'next/image';
import axios from 'axios';
import { useEffect, useState } from 'react';

const BASE_URL = 'https://eco-harvest-backend.vercel.app';

interface Advertisement {
  title: string;
  description: string;
  imageUrl?: string;
}

const Hero: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLink, setPdfLink] = useState<string | null>(null);
  const [advertisement, setAdvertisement] = useState<Advertisement[]>([]);

  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const response = await axios.get<Advertisement[]>(`${BASE_URL}/advertisement/`);
        setAdvertisement(response.data);
      } catch (error) {
        console.error('Error fetching advertisement:', error);
      }
    };

    fetchAdvertisement();
  }, []);

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BASE_URL}/report/generateorderreport`,
        {},
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setPdfLink(url);
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF');
      setIsLoading(false);
    }
  };

  return (
    <div className="text-black w-full pt-[15vh] bg-gradient-to-b from-gray-400 to-[#F5F5F5] flex items-center justify-center min-h-[100vh]">
      {advertisement.length > 0 && (
        <div className="w-full px-4 sm:px-10 md:px-[100px] flex flex-col md:flex-row items-center h-auto md:h-[95%] rounded-[20px]">
          
          <div className="select-none w-full md:w-1/2">
            <div className="w-full">
              <p className="text-3xl sm:text-4xl md:text-[55px] leading-snug sm:leading-normal md:leading-[65px]">
                {advertisement[0].title}
              </p>
            </div>
            <div className="w-full pt-2 sm:pt-3">
              <p className="text-base sm:text-lg md:text-[20px] leading-5 sm:leading-6 md:leading-[26px] text-gray-800">
                {advertisement[0].description}
              </p>
            </div>
          </div>

          <div className="mt-6 md:mt-0 md:ml-10 w-full md:w-auto flex justify-center">
            {advertisement[0].imageUrl && (
              <Image
                alt="Advertisement Image"
                className="select-none rounded-lg"
                src={advertisement[0].imageUrl}
                width={700}
                height={160}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Hero;
