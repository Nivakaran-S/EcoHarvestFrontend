"use client";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("https://eco-harvest-backend.vercel.app/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Logout failed!");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      className="bg-red-600 rounded-[5px] cursor-pointer text-white px-[15px] py-[5px]"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;