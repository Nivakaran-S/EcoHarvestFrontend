'use client';

import React from "react";
import Image from "next/image";
import Profile from "../images/profile5.png";
import Bell from "../images/bell.png";
import LogoutButton from "../../components/Logout";
import axios from "axios";

// ==== Config ====
const BASE_URL = "https://eco-harvest-backend.vercel.app/";

// ==== Types ====
export interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string; // ISO date string
}

export interface UserInformation {
  firstName: string;
  lastName: string;
  [key: string]: any; // allow other fields if present
}

interface TopNavigationProps {
  userInformation: UserInformation | null;
  id: string;
  isLoggedIn: boolean;
  notifications: Notification[];
}

// ==== Component ====
const TopNavigation: React.FC<TopNavigationProps> = ({
  id,
  isLoggedIn,
  notifications,
  userInformation
}) => {

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`${BASE_URL}/notification/${notificationId}`);
      window.location.reload(); // or consider better state update instead of reload
    } catch (err) {
      console.error("Error in deleting notification: ", err);
    }
  };

  return (
    <div className="w-full text-black  h-[10vh] flex items-center justify-between px-[30px] bg-white border-b-[1px] border-gray-400">
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative group">
          <div className="bg-gray-300 group-hover:ring-gray-600 group-hover:ring-[0.5px] cursor-pointer flex items-center justify-center rounded-full w-[36px] h-[36px]">
            <Image alt="Bell" src={Bell} height={20} width={20} />
          </div>

          <div className="absolute hidden group-hover:block bg-gray-300 px-[10px] py-[10px] h-[45vh] top-[38px] left-[0] w-[18vw] ring-gray-500 ring-[0.5px] rounded-[10px] overflow-y-auto">
            <p className="text-gray-800 text-[20px]">Notifications</p>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification._id} className="flex flex-col items-center mt-[10px] w-full">
                  <div className="bg-gray-400 ring-gray-700 ring-[0.5px] flex px-[10px] py-[5px] flex-col rounded-[5px] w-full">
                    <div className="flex flex-row justify-between items-center w-full">
                      <p className="text-black text-[15px]">{notification.title}</p>
                      <div
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="bg-gray-300 rounded-full px-[8px] text-gray-700 cursor-pointer ring-gray-700 ring-[0.5px] py-[1px]"
                      >
                        <p>X</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-[15px]">{notification.message}</p>
                    <div className="flex flex-row justify-between items-center w-full">
                      <p className="text-[13px] text-gray-200 flex flex-row justify-end pl-[5px]">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[13px] text-gray-200 pr-[10px]">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-800 text-[15px]">No notifications</p>
            )}
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-3">
          <Image
            alt="Profile"
            height={36}
            width={36}
            src={Profile}
            className="rounded-full"
          />
          <div className="leading-tight">
            <p className="text-[15px] font-medium">
              {userInformation?.firstName ?? "Admin"} {userInformation?.lastName ?? ""}
            </p>
            <p className="text-[12px] text-gray-600">Admin</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      {isLoggedIn && <LogoutButton />}
    </div>
  );
};

export default TopNavigation;
