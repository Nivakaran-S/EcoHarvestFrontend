'use client';

import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const Advertisements: React.FC = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isChanged, setIsChanged] = useState(false);
  const [onEditClick, setEditClick] = useState(false);
  const [advertisementTitle, setAdvertisementTitle] = useState('');
  const [advertisementDescription, setAdvertisementDescription] = useState('');
  const [advertisementImageUrl, setAdvertisementImageUrl] = useState('');

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await axios.get<Advertisement[]>("http://localhost:8000/advertisement");
        setAdvertisements(response.data);
      } catch (err) {
        console.error("Error in fetching advertisements: ", err);
      }
    };
    fetchAdvertisements();
  }, []);

  const updateAdvertisement = async (advertisementId: string) => {
    try {
      const response = await axios.put("http://localhost:8000/advertisement/update", {
        advertisementId,
        title: advertisementTitle,
        description: advertisementDescription,
        imageUrl: advertisementImageUrl
      });
      console.log(response.data);
      setEditClick(false);
      setIsChanged(!isChanged); // trigger re-render if needed
    } catch (err) {
      console.error("Error in updating advertisements: ", err);
    }
  };

  return (
    <div>
      <div className="bg-gray-100 flex space-x-2 flex-row h-[90vh] px-[15px] py-[8px] text-black w-full">
        <div className="bg-gray-200 rounded-[10px] py-[10px] px-[15px] w-[100%]">
          <p className="text-[18px]">All Advertisements</p>
          <div className="flex flex-col space-y-[235px] justify-between">
            <div className="flex flex-col space-y-[5px] w-[100%]">
              <div className="flex flex-row text-[13px]">
                <div className="pl-[8px] w-[180px]">
                  <p>Image</p>
                </div>
                <div className="w-[225px]">
                  <p>Title</p>
                </div>
                <div className="w-[240px]">
                  <p>Description</p>
                </div>
                <div className="w-[300px]">
                  <p>Image Url</p>
                </div>
                <div className="w-[100px]">
                  <p>Actions</p>
                </div>
              </div>

              <div className="h-[500px] flex pb-[10px] flex-col space-y-[5px]">
                {advertisements.map((advertisement) => (
                  <div
                    key={advertisement._id}
                    className="flex cursor-pointer py-[10px] flex-row border border-gray-500 bg-gray-100 rounded-[10px] text-[13px]"
                  >
                    <div className="flex flex-row w-[150px] pl-[10px] py-[10px] justify-center">
                      <div className="ml-[10px] overflow-hidden rounded-[10px] w-[100%]">
                        <Image
                          src={advertisement.imageUrl}
                          alt="advertisement"
                          width={100}
                          height={100}
                        />
                      </div>
                    </div>

                    <div className="flex items-center w-[230px] mr-[15px] pl-[20px]">
                      {!onEditClick ? (
                        <div className="bg-yellow-200 ring-[0.5px] ring-yellow-700 leading-[17px] px-[10px] py-[2px] rounded text-yellow-700">
                          <p>{advertisement.title}</p>
                        </div>
                      ) : (
                        <input
                          className="focus:outline-none px-[10px] py-[5px] rounded-[5px]"
                          onChange={(e) => setAdvertisementTitle(e.target.value)}
                          value={advertisementTitle}
                        />
                      )}
                    </div>

                    <div className="flex flex-col w-[240px] justify-center">
                      {!onEditClick ? (
                        <div className="leading-[17px] px-[10px] py-[2px] rounded">
                          <p>{advertisement.description}</p>
                        </div>
                      ) : (
                        <input
                          className="focus:outline-none w-[90%] py-[5px] px-[10px] rounded-[5px]"
                          onChange={(e) => setAdvertisementDescription(e.target.value)}
                          value={advertisementDescription}
                        />
                      )}
                    </div>

                    <div className="flex w-[310px] flex-col justify-center">
                      {!onEditClick ? (
                        <div className="leading-[17px] px-[10px] py-[2px] rounded">
                          <p>{advertisement.imageUrl}</p>
                        </div>
                      ) : (
                        <input
                          onChange={(e) => setAdvertisementImageUrl(e.target.value)}
                          className="focus:outline-none w-[90%] px-[10px] py-[5px] rounded-[5px]"
                          value={advertisementImageUrl}
                        />
                      )}
                    </div>

                    <div className="w-[100px] flex flex-row space-x-[5px] justify-center items-center">
                      {!onEditClick ? (
                        <div
                          onClick={() => setEditClick(true)}
                          className="bg-blue-500 px-[10px] cursor-pointer py-[5px] rounded text-white"
                        >
                          <p>Edit</p>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-[5px]">
                          <div
                            onClick={() => updateAdvertisement(advertisement._id)}
                            className="bg-green-500 px-[10px] cursor-pointer py-[5px] rounded text-white"
                          >
                            <p>Confirm</p>
                          </div>
                          <div
                            onClick={() => setEditClick(false)}
                            className="bg-gray-500 px-[10px] cursor-pointer py-[5px] rounded text-white"
                          >
                            <p>Cancel</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advertisements;
