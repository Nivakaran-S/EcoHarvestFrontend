import axios from "axios";
import React, { useState } from "react";

import { Notification } from "../components/types";

interface ProfileManagementProps {
  id: string;
  userInformation: any; // you can type this properly later
  notifications: Notification[];
}

// Define types for props
interface UserInformation {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password?: string;
}

interface ProfileManagementProps {
  id: string;
  userInformation: any; // you can type this properly later
  notifications: Notification[];
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ userInformation, notifications, id }) => {

  const [firstName, setFirstName] = useState<string>(userInformation[0]?.firstName || '');
  const [lastName, setLastName] = useState<string>(userInformation[0]?.lastName || '');
  const [email, setEmail] = useState<string>(userInformation[0]?.email || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(userInformation[0]?.phoneNumber || '');
  const [gender, setGender] = useState<string>(''); // not used currently
  const [username, setUsername] = useState<string>(userInformation[0]?.username || '');
  const [password, setPassword] = useState<string>('');

  const [onEditClick, setOnEditClick] = useState<boolean>(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState<boolean>(false);

  const updateInformation = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/updateAdmin', {
        firstName,
        lastName,
        email,
        phoneNumber,
        adminId: id
      });
      console.log(response.data);
      setProfileUpdateSuccess(true);
      setTimeout(() => setProfileUpdateSuccess(false), 3000);
      window.location.reload();
    } catch (err) {
      console.error("Error in updating profile: ", err);
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await axios.delete(`http://localhost:8000/notification/${notificationId}`);
      console.log(response.data);
      window.location.reload();
    } catch (err) {
      console.error("Error in deleting notification: ", err);
    }
  }

  return (
    <div className="border-t-[1px] border-gray-400 text-black flex flex-row w-[100%] h-[100vh] bg-gray-100">
      <div className="flex flex-col px-[20px] py-[10px] w-[75%]">
        <p className="text-[25px]">Profile Management</p>
        <p>Manage your account information</p>

        <div className="flex flex-col bg-gray-200 ring-gray-500 ring-[0.5px] px-[20px] py-[15px] rounded-[10px] space-y-[10px] mt-[20px]">
          {/* Personal Information */}
          <div>
            <p className="text-[20px]">Personal Information</p>
            <div className="flex flex-row space-x-[30px] justify-between">
              <div className="w-[50%]">
                <p className="ml-[5px] text-[17px]">First name</p>
                <input
                  value={firstName}
                  placeholder={userInformation[0]?.firstName || ''}
                  onChange={(e) => setFirstName(e.currentTarget.value)}
                  disabled={!onEditClick}
                  className="text-black w-[100%] outline-none ring-gray-800 ring-[0.5px] rounded-[5px] px-[10px] py-[5px]"
                />
              </div>
              <div className="w-[50%]">
                <p className="ml-[5px] text-[17px]">Last name</p>
                <input
                  value={lastName}
                  placeholder={userInformation[0]?.lastName || ''}
                  onChange={(e) => setLastName(e.currentTarget.value)}
                  disabled={!onEditClick}
                  className="text-black w-[100%] outline-none ring-gray-800 ring-[0.5px] rounded-[5px] px-[10px] py-[5px]"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <p className="text-[20px]">Contact Information</p>
            <div className="flex flex-row space-x-[30px] justify-between">
              <div className="w-[50%]">
                <p className="ml-[5px] text-[17px]">Email</p>
                <input
                  value={email}
                  placeholder={userInformation[0]?.email || ''}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  disabled={!onEditClick}
                  className="text-black w-[100%] outline-none ring-gray-800 ring-[0.5px] rounded-[5px] px-[10px] py-[5px]"
                />
              </div>
              <div className="w-[50%]">
                <p className="ml-[5px] text-[17px]">Phone number</p>
                <input
                  value={phoneNumber}
                  placeholder={userInformation[0]?.phoneNumber || ''}
                  onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                  disabled={!onEditClick}
                  className="text-black w-[100%] outline-none ring-gray-800 ring-[0.5px] rounded-[5px] px-[10px] py-[5px]"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <p className="text-[20px]">Account Information</p>
            <div className="flex flex-row space-x-[30px] justify-between">
              <div className="w-[50%]">
                <p className="ml-[5px] text-[17px]">Username</p>
                <input
                  value={username}
                  placeholder={userInformation[0]?.username || ''}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  disabled={!onEditClick}
                  className="text-black w-[100%] outline-none ring-gray-800 ring-[0.5px] rounded-[5px] px-[10px] py-[5px]"
                />
              </div>
              <div className="w-[50%]">
                <p className="ml-[5px] text-[17px]">Password</p>
                <input
                  value={password}
                  placeholder="********"
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  disabled={!onEditClick}
                  className="text-black w-[100%] outline-none ring-gray-800 ring-[0.5px] rounded-[5px] px-[10px] py-[5px]"
                />
              </div>
            </div>
          </div>

          {/* Edit / Confirm Buttons */}
          <div className="w-[100%] pt-[15px] flex flex-row justify-end">
            {onEditClick ? (
              <div className="flex space-x-[15px] flex-row justify-end items-center">
                <div
                  onClick={() => setOnEditClick(false)}
                  className="bg-gray-600 ring-gray-900 cursor-pointer ring-[0.5px] ml-[10px] px-[15px] rounded-[5px] py-[5px]"
                >
                  <p>Cancel</p>
                </div>
                <div
                  onClick={updateInformation}
                  className="bg-yellow-600 ring-yellow-900 cursor-pointer ring-[0.5px] px-[15px] rounded-[5px] py-[5px]"
                >
                  <p>Confirm</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setOnEditClick(true)}
                className="bg-gray-400 ring-gray-900 cursor-pointer ring-[0.5px] ml-[10px] px-[15px] rounded-[5px] py-[5px]"
              >
                <p>Edit</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="flex px-[20px] py-[10px] bg-gray-300 h-[100%] flex-col w-[25%]">
        <p className="text-[23px]">Notifications</p>

        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-gray-400 ring-gray-800 ring-[0.5px] rounded-[5px] px-[10px] py-[10px]"
            >
              <div className="flex flex-row justify-between items-center">
                <p className="text-[17px] leading-[22px]">{notification.title}</p>
                <div
                  onClick={() => handleDeleteNotification(notification._id)}
                  className="w-fit bg-gray-400 rounded-full text-[15px] pt-[1px] ring-gray-600 ring-[0.5px] px-[7px] cursor-pointer text-gray-900 rounded-[5px]"
                >
                  <p>X</p>
                </div>
              </div>
              <p className="text-[13px] pl-[10px]">{notification.message}</p>
              <div className="flex flex-row justify-between">
                <p className="text-[13px] flex flex-row justify-end pl-[10px]">
                  {new Date(notification.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[13px] pr-[10px]">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-800 text-[15px]">No notifications</p>
        )}
      </div>

      {profileUpdateSuccess && (
        <div className="absolute bottom-0 left-0 text-black mx-[280px] opacity-[94%] my-[15px] bg-green-500 ring-green-800 ring-[1px] rounded-[5px] px-[20px] py-[15px]">
          <p>Admin profile updated successfully</p>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;
