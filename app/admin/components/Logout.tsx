"use client";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/logout", {
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
      className="bg-red-500 border-red-900 border-[1px] rounded-[5px] px-[10px] py-[5px]"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
