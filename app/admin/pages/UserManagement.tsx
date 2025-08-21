import React, { useEffect, useState } from "react";
import axios from "axios";

// Define types
interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

interface User {
  id: string;
  username: string;
  role: string;
  userDetails: UserDetails;
}

export default function UserManagement() {
  const [userInformation, setUserInformation] = useState<User[]>([]);

  // Admin registration state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [adminRegistrationSuccess, setAdminRegistrationSuccess] = useState<boolean>(false);

  // Vendor registration state
  const [vendorFirstName, setVendorFirstName] = useState<string>("");
  const [vendorLastName, setVendorLastName] = useState<string>("");
  const [vendorEmail, setVendorEmail] = useState<string>("");
  const [vendorPhoneNumber, setVendorPhoneNumber] = useState<string>("");
  const [vendorBusinessName, setVendorBusinessName] = useState<string>("");
  const [vendorUsername, setVendorUsername] = useState<string>("");
  const [vendorPassword, setVendorPassword] = useState<string>("");
  const [vendorRegistrationSuccess, setVendorRegistrationSuccess] = useState<boolean>(false);

  // Fetch users
  useEffect(() => {
    const fetchUserManagement = async () => {
      try {
        setLoading(true);
        const response = await axios.get<User[]>("http://localhost:8000/api/auth");
        setUserInformation(response.data);
      } catch (error) {
        console.error("Error fetching user management:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserManagement();
  }, []);

  // Admin registration
  const registerAdmin = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !gender || !username || !password) {
      alert("Please fill all the fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/auth/registerAdmin", {
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        username,
        password,
      });
      console.log(response.data);

      // Reset fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setGender("");
      setUsername("");
      setPassword("");

      setAdminRegistrationSuccess(true);
      setTimeout(() => setAdminRegistrationSuccess(false), 3000);
    } catch (error) {
      console.error("Error registering admin:", error);
    }
  };

  // Vendor registration
  const registerVendor = async () => {
    if (
      !vendorFirstName ||
      !vendorLastName ||
      !vendorEmail ||
      !vendorPhoneNumber ||
      !vendorBusinessName ||
      !vendorUsername ||
      !vendorPassword
    ) {
      alert("Please fill all the fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/auth/registerVendor", {
        firstName: vendorFirstName,
        lastName: vendorLastName,
        email: vendorEmail,
        phoneNumber: vendorPhoneNumber,
        businessName: vendorBusinessName,
        username: vendorUsername,
        password: vendorPassword,
      });
      console.log(response.data);

      // Reset fields
      setVendorFirstName("");
      setVendorLastName("");
      setVendorEmail("");
      setVendorPhoneNumber("");
      setVendorBusinessName("");
      setVendorUsername("");
      setVendorPassword("");

      setVendorRegistrationSuccess(true);
      setTimeout(() => setVendorRegistrationSuccess(false), 3000);
    } catch (error) {
      console.error("Error registering vendor:", error);
    }
  };

  return (
    <div className="flex border-t-[1px] border-gray-500 flex-row">
      {/* Left Panel - Users & Vendor Registration */}
      <div className="w-[75%] text-black h-[90vh] py-[20px] overflow-y-scroll px-[25px] bg-gray-100 flex flex-col">
        <p className="text-black text-[21px]">User Management System</p>

        {/* Vendor Registration */}
        <div className="bg-white text-black border-[1px] border-gray-300 rounded-[10px] pt-[20px] pb-[20px] px-[25px] mt-[10px] flex flex-col">
          <p className="text-[35px]">Vendor Registration</p>
          <div className="flex flex-col space-y-[20px]">
            <div>
              <p className="text-[20px]">Business Information</p>
              <div className="flex flex-row space-x-[20px] w-[100%]">
                <div className="w-[100%]">
                  <p>First name</p>
                  <input
                    value={vendorFirstName}
                    onChange={(e) => setVendorFirstName(e.currentTarget.value)}
                    type="text"
                    className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
                  />
                </div>
                <div className="w-[100%]">
                  <p>Last name</p>
                  <input
                    value={vendorLastName}
                    onChange={(e) => setVendorLastName(e.currentTarget.value)}
                    type="text"
                    className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
                  />
                </div>
              </div>
              <div className="flex flex-row">
                <div className="w-[100%]">
                  <p>Business name</p>
                  <input
                    value={vendorBusinessName}
                    onChange={(e) => setVendorBusinessName(e.currentTarget.value)}
                    type="text"
                    className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
                  />
                </div>
              </div>
            </div>

            <div className="w-[100%]">
              <p className="text-[20px]">Contact Information</p>
              <div className="flex flex-row space-x-[20px] w-[100%]">
                <div className="w-[100%]">
                  <p>Email</p>
                  <input
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.currentTarget.value)}
                    type="text"
                    className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
                  />
                </div>
                <div className="w-[100%]">
                  <p>Phone number</p>
                  <input
                    value={vendorPhoneNumber}
                    onChange={(e) => setVendorPhoneNumber(e.currentTarget.value)}
                    type="text"
                    className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
                  />
                </div>
              </div>
            </div>

            <div className="">
              <p className="text-[20px]">Account Information</p>
              <div className="flex flex-row space-x-[20px] w-[100%]">
                <div className="w-[100%]">
                  <p>Username</p>
                  <input
                    value={vendorUsername}
                    onChange={(e) => setVendorUsername(e.currentTarget.value)}
                    type="text"
                    className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
                  />
                </div>
                <div className="w-[100%]">
                  <p>Password</p>
                  <input
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.currentTarget.value)}
                    type="text"
                    className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
                  />
                </div>
              </div>
              <div
                className="mt-[15px] bg-yellow-500 flex items-center ring-yellow-800 ring-[0.5px] cursor-pointer justify-center py-[5px] rounded-[5px]"
                onClick={registerVendor}
              >
                <p>Register</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registered Users */}
        <p className="text-[25px] mt-[40px]">Registered Users</p>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-600 text-[18px]">Loading users...</p>
          </div>
        ) : (
          userInformation.map(
            (user) =>
              user.userDetails && (
                <div
                  key={user.id}
                  className="bg-white text-black border-[1px] border-gray-300 rounded-[10px] py-[10px] px-[15px] mt-[10px] flex flex-col"
                >
                  <p className="text-[20px] leading-[17px] ">
                    {user.userDetails.firstName} {user.userDetails.lastName}
                  </p>
                  <p className="text-gray-600">{user.role}</p>
                  <p className="text-black text-[18px]">{user.username}</p>
                  <div className="px-[10px]">
                    <div className="flex flex-row justify-between items-center">
                      <p>Phone number: {user.userDetails.phoneNumber}</p>
                      <p>Email: {user.userDetails.email}</p>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <p>Date of birth: {user.userDetails.dateOfBirth}</p>
                      <p>Gender: {user.userDetails.gender}</p>
                    </div>
                    <p>Address: {user.userDetails.address}</p>
                  </div>
                </div>
              )
          )
        )}
      </div>

      {/* Right Panel - Admin Registration */}
      <div className="w-[25%] py-[10px] px-[15px] h-[100vh] bg-gray-300 flex flex-col text-black">
        <p className="text-[25px]">Admin Registration</p>
        <div className="mt-[5px]">
          <p className="text-[15px]">First name</p>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.currentTarget.value)}
            type="text"
            className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
          />
        </div>
        <div className="mt-[5px]">
          <p className="text-[15px]">Last name</p>
          <input
            value={lastName}
            type="text"
            onChange={(e) => setLastName(e.currentTarget.value)}
            className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
          />
        </div>
        <div className="mt-[5px]">
          <p className="text-[15px]">Email</p>
          <input
            value={email}
            type="text"
            onChange={(e) => setEmail(e.currentTarget.value)}
            className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
          />
        </div>
        <div className="mt-[5px]">
          <p className="text-[15px]">Phone number</p>
          <input
            value={phoneNumber}
            type="text"
            onChange={(e) => setPhoneNumber(e.currentTarget.value)}
            className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
          />
        </div>
        <div className="mt-[5px]">
          <p className="text-[15px]">Gender</p>
          <select
            value={gender}
            className="border-[1px] cursor-pointer outline-none border-gray-400 rounded-[5px] px-[10px] py-[5px] w-[100%]"
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="mt-[5px]">
          <p className="text-[15px]">Username</p>
          <input
            value={username}
            type="text"
            onChange={(e) => setUsername(e.currentTarget.value)}
            className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
          />
        </div>
        <div className="mt-[5px]">
          <p className="text-[15px]">Password</p>
          <input
            value={password}
            type="text"
            onChange={(e) => setPassword(e.currentTarget.value)}
            className="border-[1px] outline-none border-gray-400 rounded-[5px] px-[10px] py-[2px] w-[100%]"
          />
        </div>
        <div
          onClick={registerAdmin}
          className="mt-[15px] bg-yellow-500 flex items-center ring-yellow-800 ring-[0.5px] cursor-pointer justify-center py-[5px] rounded-[5px]"
        >
          <p>Register</p>
        </div>
      </div>

      {/* Registration success messages */}
      {adminRegistrationSuccess && (
        <div className="absolute bottom-0 left-0 text-black mx-[280px] opacity-[94%] my-[15px] bg-green-500 ring-green-800 ring-[1px] rounded-[5px] px-[20px] py-[15px]">
          <p>Admin registered successfully</p>
        </div>
      )}
      {vendorRegistrationSuccess && (
        <div className="absolute bottom-0 left-0 text-black mx-[280px] opacity-[94%] my-[15px] bg-orange-500 ring-orange-800 ring-[1px] rounded-[5px] px-[20px] py-[15px]">
          <p>Vendor registered successfully</p>
        </div>
      )}
    </div>
  );
}
