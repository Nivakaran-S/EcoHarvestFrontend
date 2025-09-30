import { FiHome, FiBox, FiShoppingCart, FiBarChart2, FiUser } from "react-icons/fi";
import Link from "next/link";
import React from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 fixed z-[99] bg-black text-white h-screen p-5">
      <h2 className="text-2xl font-bold mb-8">EcoHarvest</h2>
      <nav className="flex flex-col space-y-4">
        <Link href="/vendor" passHref>
          <div className="flex items-center space-x-2 p-2 hover:bg-yellow-700 rounded cursor-pointer">
            <FiHome /> <span>Dashboard</span>
          </div>
        </Link>
        <Link href="/vendor/products" passHref>
          <div className="flex items-center space-x-2 p-2 hover:bg-yellow-700 rounded cursor-pointer">
            <FiBox /> <span>Products</span>
          </div>
        </Link>
        <Link href="/vendor/orders" passHref>
          <div className="flex items-center space-x-2 p-2 hover:bg-yellow-700 rounded cursor-pointer">
            <FiShoppingCart /> <span>Orders</span>
          </div>
        </Link>
        <Link href="/vendor/analysis" passHref>
          <div className="flex items-center space-x-2 p-2 hover:bg-yellow-700 rounded cursor-pointer">
            <FiBarChart2 /> <span>Analytics</span>
          </div>
        </Link>
        <Link href="/vendor/profile" passHref>
          <div className="flex items-center space-x-2 p-2 hover:bg-yellow-700 rounded cursor-pointer">
            <FiUser /> <span>Profile</span>
          </div>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
