"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import EcoHarvest from "../images/ecoHarvestLogo.png";

// Base URL for API requests
const BASE_URL = "https://eco-harvest-backend.vercel.app/api/auth";

// Define interfaces for type safety
interface LoginResponse {
  role: "Vendor" | "Company" | "Customer" | "Admin";
}

const Login: React.FC = () => {
  const router = useRouter();

  const [loginClick, setLoginClick] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [registrationType, setRegistrationType] = useState<"Individual" | "Business">("Individual");
  const [registrationPage, setRegistrationPage] = useState<number>(1);

  const [regFirstName, setRegFirstName] = useState<string>("");
  const [regLastName, setRegLastName] = useState<string>("");
  const [regDateOfBirth, setRegDateOfBirth] = useState<string>("");
  const [regGender, setRegGender] = useState<string>("");
  const [regAddress, setRegAddress] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPhoneNumber, setRegPhoneNumber] = useState<string>("");
  const [regUserName, setRegUserName] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regRepeatPassword, setRegRepeatPassword] = useState<string>("");

  const [comFirstName, setComFirstName] = useState<string>("");
  const [comLastName, setComLastName] = useState<string>("");
  const [comDateOfBirth, setComDateOfBirth] = useState<string>("");
  const [comGender, setComGender] = useState<string>("");
  const [comAddress, setComAddress] = useState<string>("");
  const [comEmail, setComEmail] = useState<string>("");
  const [comPhoneNumber, setComPhoneNumber] = useState<string>("");
  const [comUserName, setComUserName] = useState<string>("");
  const [comPassword, setComPassword] = useState<string>("");
  const [comRepeatPassword, setComRepeatPassword] = useState<string>("");
  const [comCompanyName, setComCompanyName] = useState<string>("");
  const [comCategory, setComCategory] = useState<string>("");

  const [loginError, setLoginError] = useState<boolean>(false);
  const [registrationError, setRegistrationError] = useState<boolean>(false);

  const handleLoginClick = (): void => {
    setLoginClick(!loginClick);
  };

  const handleLoginSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        `${BASE_URL}/login`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(response.data);
      console.log("Login successful");
      setLoginError(false);

      // Add a small delay to ensure cookie is set before navigation
      setTimeout(() => {
        switch (response.data.role) {
          case "Vendor":
            router.push("/vendor");
            break;
          case "Company":
          case "Customer":
            router.push("/");
            break;
          case "Admin":
            router.push("/admin");
            break;
          default:
            console.error("Unknown role:", response.data.role);
            break;
        }
      }, 100); 

    } catch (err) {
      console.error("Login error:", err);
      setLoginError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationTypeClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    setRegistrationType(e.currentTarget.innerText as "Individual" | "Business");
  };

  const handleIndividualRegistration = async (): Promise<void> => {
    if (regPassword !== regRepeatPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!regUserName || !regPassword || !regRepeatPassword) {
      setRegistrationError(true);
      return;
    }

    try {
      console.log("Registration attempt");
      const response = await axios.post(
        `${BASE_URL}/registerIndividualCustomer`,
        {
          firstName: regFirstName,
          lastName: regLastName,
          phoneNumber: regPhoneNumber,
          email: regEmail,
          dateOfBirth: regDateOfBirth,
          gender: regGender,
          address: regAddress,
          username: regUserName,
          password: regPassword,
        }
      );

      console.log("Registration successful:", response.data);
      window.location.reload();
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.response) {
        alert(
          `Registration failed: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        alert("Registration failed: No response from server");
      } else {
        alert("Registration failed: " + error.message);
      }
    }
  };

  const handleBusinessRegistration = async (): Promise<void> => {
    if (comPassword !== comRepeatPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!comUserName || !comPassword || !comRepeatPassword) {
      setRegistrationError(true);
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/registerCompanyCustomer`,
        {
          firstName: comFirstName,
          lastName: comLastName,
          companyName: comCompanyName,
          phoneNumber: comPhoneNumber,
          email: comEmail,
          dateOfBirth: comDateOfBirth,
          gender: comGender,
          address: comAddress,
          category: comCategory,
          username: comUserName,
          password: comPassword,
        }
      );
      console.log(response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error in registering:", error);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-center min-h-screen text-black bg-gray-100 lg:bg-white relative overflow-hidden">
      {/* Mobile Header Logo */}
      <div className="lg:hidden w-full flex items-center justify-center py-6 bg-[#101010]">
        <Image height={120} width={200} src={EcoHarvest} alt="EcoHarvest Logo" />
      </div>

      {/* Login Section */}
      <div className={`w-full lg:w-[38.2%] h-auto lg:h-[100vh] bg-gray-200 flex ring-0 lg:ring-[0.5px] ring-gray-500 items-center justify-center py-6 lg:py-0 ${loginClick ? 'hidden lg:flex' : 'flex'}`}>
        <div className="w-[90%] sm:w-[70%] lg:w-[43%] px-4 lg:px-0">
          <p className="text-2xl sm:text-3xl lg:text-[35px] mb-4 lg:mb-[20px] text-center lg:text-left">Login</p>
          <div className="flex flex-col space-y-4 lg:space-y-[17px]">
            <div className="flex relative flex-col">
              <input
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                type="text"
                className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                placeholder=" "
              />
              <label
                className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                    -translate-y-1/2                            
                    peer-placeholder-shown:top-1/2              
                    peer-placeholder-shown:translate-y-[-50%]   
                    peer-focus:top-0                            
                    peer-focus:text-[11px] lg:peer-focus:text-[13px]
                    peer-focus:text-blue-500
                    peer-focus:bg-gray-200
                    peer-not-placeholder-shown:top-0            
                    top-0                                       
                    text-[11px] lg:text-[13px]
                    pointer-events-none"
              >
                Username
              </label>
            </div>

            <div className="flex relative flex-col">
              <input
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                type="password"
                className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                placeholder=" "
              />
              <label
                className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                    -translate-y-1/2                            
                    peer-placeholder-shown:top-1/2              
                    peer-placeholder-shown:translate-y-[-50%]   
                    peer-focus:top-0                            
                    peer-focus:text-[11px] lg:peer-focus:text-[13px]
                    peer-focus:text-blue-500
                    peer-focus:bg-gray-200
                    peer-not-placeholder-shown:top-0            
                    top-0                                       
                    text-[11px] lg:text-[13px]
                    pointer-events-none"
              >
                Password
              </label>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div
              onClick={handleLoginSubmit}
              className="flex mt-4 lg:mt-[19px] ring-yellow-700 ring-[0.5px] flex-col items-center justify-center w-full bg-[#FDAA1C] text-sm lg:text-[15px] cursor-pointer py-3 lg:py-[4px] rounded-[3px] hover:bg-yellow-500 transition-colors"
            >
              <p>{isLoading ? 'Logging in...' : 'Login'}</p>
            </div>
            <p className="mt-2 lg:mt-[2px] text-xs lg:text-[13px] text-center">
              Don&apos;t have an account?
              <span
                onClick={handleLoginClick}
                className="ml-[2px] text-blue-800 cursor-pointer"
              >
                Register
              </span>
            </p>
          </div>
          {loginError && (
            <div className="relative flex mt-[10px] items-center justify-center text-red-900 text-xs lg:text-[13px] py-[3px] rounded-[3px] ring-[0.5px] ring-red-900 bg-red-400">
              <p>Invalid Username or Password</p>
            </div>
          )}
          <div className="bg-white rounded-[10px] ring-[0.5px] ring-[#101010] px-3 lg:px-[15px] py-3 lg:py-[10px] mt-[10px]">
            <div className="mb-2">
              <p className="text-base lg:text-[20px] font-bold">Customer</p>
              <p className="text-sm lg:text-base">Username: aaa</p>
              <p className="text-sm lg:text-base">Password: aaa</p>
            </div>
            <div className="mb-2">
              <p className="text-base lg:text-[20px] font-bold">Vendor</p>
              <p className="text-sm lg:text-base">Username: test</p>
              <p className="text-sm lg:text-base">Password: test</p>
            </div>
            <div>
              <p className="text-base lg:text-[20px] font-bold">Admin</p>
              <p className="text-sm lg:text-base">Username: tony</p>
              <p className="text-sm lg:text-base">Password: tony</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Middle Section */}
      <div className="hidden lg:flex w-[23.6%] h-full bg-gray-200 ring-[0.5px] ring-gray-500 items-center justify-center"></div>

      {/* Register Section */}
      <div className={`w-full lg:w-[38.2%] h-auto lg:h-[100vh] bg-gray-200 flex ring-0 lg:ring-[0.5px] ring-gray-500 items-center justify-center py-6 lg:py-0 ${!loginClick ? 'hidden lg:flex' : 'flex'}`}>
        <div className="w-[90%] sm:w-[70%] lg:w-[50%] px-4 lg:px-0 max-h-screen overflow-y-auto">
          <p className="text-2xl sm:text-3xl lg:text-[35px] mb-4 lg:mb-[20px] text-center lg:text-left">Register</p>
          <div className="flex flex-col space-y-3 lg:space-y-[10px]">
            <div className="flex relative mb-2 lg:mb-[5px] flex-row space-x-[3px] bg-gray-400 rounded-[10px] px-[8px] mx-[3px] py-[5px] ring-[0.5px] ring-gray-600 items-center">
              <div
                onClick={handleRegistrationTypeClick}
                className={`${
                  registrationType === "Individual" ? "text-white" : ""
                } py-2 lg:py-[5px] z-[10] w-[50%] flex items-center justify-center cursor-pointer text-sm lg:text-base`}
              >
                <p>Individual</p>
              </div>
              <div
                onClick={handleRegistrationTypeClick}
                className={`${
                  registrationType === "Business" ? "text-white" : ""
                } w-[50%] z-[10] flex items-center justify-center cursor-pointer text-sm lg:text-base`}
              >
                <p>Business</p>
              </div>
              <div
                className={`${
                  registrationType === "Individual" ? "" : "right-[6px]"
                } transition-transform animation duration-500 bg-gray-500 ring-[0.5px] ring-gray-700 absolute h-[30px] lg:h-[30px] rounded-[5px] py-[5px] w-[50%] flex items-center justify-center cursor-pointer`}
              ></div>
            </div>

            {/* Individual Registration */}
            <div className={`${registrationType === "Individual" ? "flex flex-col space-y-3 lg:space-y-[10px]" : "hidden"}`}>
              {registrationPage === 1 ? (
                <div>
                  <div className="flex flex-row items-center justify-center mb-4">
                    <div className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[1px] ring-black text-[14px] h-[20px] rounded-full bg-yellow-500 z-[10]">
                      <p>1</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div
                      onClick={() => setRegistrationPage(2)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>2</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div
                      onClick={() => setRegistrationPage(3)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>3</p>
                    </div>
                  </div>
                  <div className="flex flex-col px-[10px] space-y-3 lg:space-y-[15px]">
                    <div>
                      <p className="text-sm lg:text-base">Personal Information</p>
                    </div>
                    <div className="flex relative flex-col">
                      <input
                        type="text"
                        value={regFirstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegFirstName(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        First name
                      </label>
                    </div>

                    <div className="flex relative flex-col">
                      <input
                        type="text"
                        value={regLastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegLastName(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        Last name
                      </label>
                    </div>

                    <div className="flex relative flex-col">
                      <input
                        type="date"
                        value={regDateOfBirth}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegDateOfBirth(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        Date of birth
                      </label>
                    </div>

                    <div className="flex relative flex-col">
                      <div className="peer ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none bg-white">
                        <select
                          value={regGender}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegGender(e.target.value)}
                          className="w-full focus:outline-none text-sm lg:text-base"
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex relative flex-col">
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegAddress(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        Address
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={() => {
                        if (
                          regFirstName &&
                          regLastName &&
                          regDateOfBirth &&
                          regGender &&
                          regAddress
                        ) {
                          setRegistrationPage(2);
                          setRegistrationError(false);
                        } else {
                          setRegistrationError(true);
                        }
                      }}
                      className="flex mt-4 lg:mt-[19px] ring-yellow-700 ring-[0.5px] flex-col items-center justify-center w-full bg-[#FDAA1C] text-sm lg:text-[15px] cursor-pointer py-3 lg:py-[4px] rounded-[3px] hover:bg-yellow-500 transition-colors"
                    >
                      <p>Continue</p>
                    </div>
                    <p className="mt-2 lg:mt-[2px] text-xs lg:text-[13px] text-center">
                      Already have an account?
                      <span
                        onClick={handleLoginClick}
                        className="ml-[2px] text-blue-800 cursor-pointer"
                      >
                        Login
                      </span>
                    </p>
                    {registrationError && (
                      <div className="bg-red-300 mt-[5px] py-[3px] px-4 lg:px-[20px] ring-[1px] ring-red-800 text-red-950 rounded-[5px] text-xs lg:text-sm">
                        <p>Please fill all the fields</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col px-[5px] mt-[5px] space-y-3 lg:space-y-[13px]">
                  <div className="flex flex-row items-center justify-center mb-4">
                    <div
                      onClick={() => setRegistrationPage(1)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>1</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div
                      onClick={() => setRegistrationPage(2)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>2</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[1px] ring-black text-[14px] h-[20px] rounded-full bg-yellow-500 z-[10]">
                      <p>3</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm lg:text-base">Account Information</p>
                  </div>
                  <div className="flex relative flex-col">
                    <input
                      type="text"
                      value={regUserName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegUserName(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Username
                    </label>
                  </div>

                  <div className="flex relative flex-col">
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPassword(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Password
                    </label>
                  </div>
                  <div className="flex relative flex-col">
                    <input
                      type="password"
                      value={regRepeatPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegRepeatPassword(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Repeat password
                    </label>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={handleIndividualRegistration}
                      className="flex mt-4 lg:mt-[19px] ring-yellow-700 ring-[0.5px] flex-col items-center justify-center w-full bg-[#FDAA1C] text-sm lg:text-[15px] cursor-pointer py-3 lg:py-[4px] rounded-[3px] hover:bg-yellow-500 transition-colors"
                    >
                      <p>Register</p>
                    </div>
                    <p className="mt-2 lg:mt-[2px] text-xs lg:text-[13px] text-center">
                      Already have an account?
                      <span
                        onClick={handleLoginClick}
                        className="ml-[2px] text-blue-800 cursor-pointer"
                      >
                        Login
                      </span>
                    </p>

                    {registrationError && (
                      <div className="bg-red-300 mt-[5px] py-[3px] px-4 lg:px-[20px] ring-[1px] ring-red-800 text-red-950 rounded-[5px] text-xs lg:text-sm">
                        <p>Please fill all the fields</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Business Registration */}
            <div className={`${registrationType === "Business" ? "flex flex-col space-y-3 lg:space-y-[10px]" : "hidden"}`}>
              {registrationPage === 1 ? (
                <div>
                  <div className="flex flex-row items-center justify-center mb-4">
                    <div className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[1px] ring-black text-[14px] h-[20px] rounded-full bg-yellow-500 z-[10]">
                      <p>1</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div
                      onClick={() => setRegistrationPage(2)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>2</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div
                      onClick={() => setRegistrationPage(3)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>3</p>
                    </div>
                  </div>
                  <div className="flex flex-col px-[5px] space-y-3 lg:space-y-[15px]">
                    <div>
                      <p className="text-sm lg:text-base">Business Information</p>
                    </div>
                    <div className="flex relative flex-col">
                      <input
                        type="text"
                        value={comCompanyName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComCompanyName(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        Company name
                      </label>
                    </div>

                    <div className="flex relative flex-col">
                      <input
                        type="text"
                        value={comFirstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComFirstName(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        First name
                      </label>
                    </div>

                    <div className="flex relative flex-col">
                      <input
                        type="text"
                        value={comLastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComLastName(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        Last name
                      </label>
                    </div>

                    <div className="flex relative flex-col">
                      <input
                        type="date"
                        value={comDateOfBirth}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComDateOfBirth(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        Date of birth
                      </label>
                    </div>

                    <div className="flex relative flex-col">
                      <div className="peer ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none bg-white">
                        <select
                          value={comGender}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setComGender(e.target.value)}
                          className="w-full focus:outline-none text-sm lg:text-base"
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex relative flex-col">
                      <input
                        type="text"
                        value={comCategory}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComCategory(e.target.value)}
                        className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                        placeholder=" "
                      />
                      <label
                        className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                            -translate-y-1/2                            
                            peer-placeholder-shown:top-1/2              
                            peer-placeholder-shown:translate-y-[-50%]   
                            peer-focus:top-0                            
                            peer-focus:text-[11px] lg:peer-focus:text-[13px]
                            peer-focus:text-blue-500
                            peer-focus:bg-gray-200
                            peer-not-placeholder-shown:top-0            
                            top-0                                       
                            text-[11px] lg:text-[13px]
                            pointer-events-none"
                      >
                        Category
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={() => {
                        if (
                          comCompanyName &&
                          comFirstName &&
                          comLastName &&
                          comDateOfBirth &&
                          comGender &&
                          comCategory
                        ) {
                          setRegistrationPage(2);
                          setRegistrationError(false);
                        } else {
                          setRegistrationError(true);
                        }
                      }}
                      className="flex mt-4 lg:mt-[19px] ring-yellow-700 ring-[0.5px] flex-col items-center justify-center w-full bg-[#FDAA1C] text-sm lg:text-[15px] cursor-pointer py-3 lg:py-[4px] rounded-[3px] hover:bg-yellow-500 transition-colors"
                    >
                      <p>Continue</p>
                    </div>
                    <p className="mt-2 lg:mt-[2px] text-xs lg:text-[13px] text-center">
                      Already have an account?
                      <span
                        onClick={handleLoginClick}
                        className="ml-[2px] text-blue-800 cursor-pointer"
                      >
                        Login
                      </span>
                    </p>

                    {registrationError && (
                      <div className="bg-red-300 mt-[5px] py-[3px] px-4 lg:px-[20px] ring-[1px] ring-red-800 text-red-950 rounded-[5px] text-xs lg:text-sm">
                        <p>Please fill all the fields</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : registrationPage === 2 ? (
                <div className="flex flex-col px-[5px] mt-[10px] space-y-3 lg:space-y-[13px]">
                  <div className="flex flex-row items-center justify-center mb-4">
                    <div
                      onClick={() => setRegistrationPage(1)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>1</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[1px] ring-black text-[14px] h-[20px] rounded-full bg-yellow-500 z-[10]">
                      <p>2</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div
                      onClick={() => setRegistrationPage(3)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>3</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm lg:text-base">Contact Information</p>
                  </div>
                  <div className="flex relative flex-col">
                    <input
                      type="text"
                      value={comEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComEmail(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Email
                    </label>
                  </div>

                  <div className="flex relative flex-col">
                    <input
                      type="text"
                      value={comAddress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComAddress(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Address
                    </label>
                  </div>

                  <div className="flex relative flex-col">
                    <input
                      type="text"
                      value={comPhoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComPhoneNumber(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Phone number
                    </label>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={() => {
                        if (comEmail && comAddress && comPhoneNumber) {
                          setRegistrationPage(3);
                          setRegistrationError(false);
                        } else {
                          setRegistrationError(true);
                        }
                      }}
                      className="flex mt-4 lg:mt-[19px] ring-yellow-700 ring-[0.5px] flex-col items-center justify-center w-full bg-[#FDAA1C] text-sm lg:text-[15px] cursor-pointer py-3 lg:py-[4px] rounded-[3px] hover:bg-yellow-500 transition-colors"
                    >
                      <p>Continue</p>
                    </div>
                    <p className="mt-2 lg:mt-[2px] text-xs lg:text-[13px] text-center">
                      Already have an account?
                      <span
                        onClick={handleLoginClick}
                        className="ml-[2px] text-blue-800 cursor-pointer"
                      >
                        Login
                      </span>
                    </p>

                    {registrationError && (
                      <div className="bg-red-300 mt-[5px] py-[3px] px-4 lg:px-[20px] ring-[1px] ring-red-800 text-red-950 rounded-[5px] text-xs lg:text-sm">
                        <p>Please fill all the fields</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col px-[5px] mt-[10px] space-y-3 lg:space-y-[13px]">
                  <div className="flex flex-row items-center justify-center mb-4">
                    <div
                      onClick={() => setRegistrationPage(1)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>1</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div
                      onClick={() => setRegistrationPage(2)}
                      className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[0.5px] ring-gray-600 text-[14px] h-[20px] rounded-full bg-gray-400"
                    >
                      <p>2</p>
                    </div>
                    <div className="w-[10px] h-[3px] bg-gray-600"></div>
                    <div className="flex items-center cursor-pointer justify-center w-[20px] pt-[1.5px] ring-[1px] ring-black text-[14px] h-[20px] rounded-full bg-yellow-500 z-[10]">
                      <p>3</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm lg:text-base">Account Information</p>
                  </div>
                  <div className="flex relative flex-col">
                    <input
                      type="text"
                      value={comUserName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComUserName(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Username
                    </label>
                  </div>

                  <div className="flex relative flex-col">
                    <input
                      type="password"
                      value={comPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComPassword(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Password
                    </label>
                  </div>
                  <div className="flex relative flex-col">
                    <input
                      type="password"
                      value={comRepeatPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComRepeatPassword(e.target.value)}
                      className="peer bg-white ring-[0.5px] rounded-[5px] py-3 lg:py-[5px] px-[10px] focus:outline-none placeholder-transparent text-sm lg:text-base"
                      placeholder=" "
                    />
                    <label
                      className="absolute left-[10px] text-gray-500 rounded-[5px] px-[10px] bg-white transition-all duration-200 transform
                          -translate-y-1/2                            
                          peer-placeholder-shown:top-1/2              
                          peer-placeholder-shown:translate-y-[-50%]   
                          peer-focus:top-0                            
                          peer-focus:text-[11px] lg:peer-focus:text-[13px]
                          peer-focus:text-blue-500
                          peer-focus:bg-gray-200
                          peer-not-placeholder-shown:top-0            
                          top-0                                       
                          text-[11px] lg:text-[13px]
                          pointer-events-none"
                    >
                      Repeat password
                    </label>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={handleBusinessRegistration}
                      className="flex mt-4 lg:mt-[19px] ring-yellow-700 ring-[0.5px] flex-col items-center justify-center w-full bg-[#FDAA1C] text-sm lg:text-[15px] cursor-pointer py-3 lg:py-[4px] rounded-[3px] hover:bg-yellow-500 transition-colors"
                    >
                      <p>Register</p>
                    </div>
                    <p className="mt-2 lg:mt-[2px] text-xs lg:text-[13px] text-center">
                      Already have an account?
                      <span
                        onClick={handleLoginClick}
                        className="ml-[2px] text-blue-800 cursor-pointer"
                      >
                        Login
                      </span>
                    </p>

                    {registrationError && (
                      <div className="bg-red-300 mt-[5px] py-[3px] px-4 lg:px-[20px] ring-[1px] ring-red-800 text-red-950 rounded-[5px] text-xs lg:text-sm">
                        <p>Please fill all the fields</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sliding Logo Panel */}
      <div
        className={`${
          loginClick ? "translate-x-[-294px]" : "right-0"
        } hidden lg:flex transition-transform z-[200] ease-out duration-500 w-[61.8%] absolute h-full bg-[#101010] text-white ring-[0.5px] ring-gray-500 items-center justify-center`}
      >
        <Image height={280} src={EcoHarvest} alt="EcoHarvest Logo" />
      </div>

      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={handleLoginClick}
          className="bg-[#FDAA1C] text-black px-4 py-2 rounded-full shadow-lg hover:bg-yellow-500 transition-colors text-sm font-medium"
        >
          {loginClick ? 'Login' : 'Register'}
        </button>
      </div>
    </div>
  );
};

export default Login;