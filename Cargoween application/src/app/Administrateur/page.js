"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebare-admin";
import {FaUser} from "react-icons/fa";

export default function AddTransitaire() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "", lastname: "", email: "", company: "", country: "",
    city: "", address: "", postalCode: "", companyID: "", function: "",
    phone: "", cassNumber: "", password: "", confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);



  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUser(data);
    };
    fetchUser();
    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-menu")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


 
  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-32 shadow-lg relative">
        <div className="absolute top-14 right-8">

        <div className="relative user-menu">
    <button
      className="flex items-center bg-[#3F6592] text-white py-1 px-4 rounded-full shadow-md"
      onClick={() => setUserMenuOpen(!userMenuOpen)}
    >
      <FaUser className="mr-2" />
      <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
    </button>

    {userMenuOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white text-[#3F6592] rounded-lg shadow-lg z-50">
        <button
          onClick={() => {
            setUserMenuOpen(false);
            window.location.href = "/Administrateur/Profil"; 
          }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Modifier profil
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/login";
          }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Se déconnecter
        </button>
      </div>
    )}
  </div>
  </div>
          <h2 className="text-2xl font-semibold text-[#3F6592] mb-10 text-center">
Tableau de bord          </h2>

          {message && <p className="text-center text-red-500 mb-4">{message}</p>}

          {/* Image du dashboard */}
<div className="flex justify-center mb-30">
  <img src="/dash.jpg" alt="Dashboard" className="rounded-xl shadow-md w-full max-w-6xl" />
</div>
        </div>
      </main>
    </div>
  );
}

