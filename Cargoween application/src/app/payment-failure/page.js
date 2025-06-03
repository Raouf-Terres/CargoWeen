"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { FaUser } from "react-icons/fa";

export default function PaymentFailure() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
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
      <main
        className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? "ml-64" : "ml-20"}`}
      >
        <div className="bg-white rounded-3xl p-32 shadow-lg relative text-center">
          <div className="absolute top-14 right-8">
            <div className="relative user-menu">
              <button
                className="flex items-center bg-[#3F6592] text-white py-1 px-4 rounded-full shadow-md"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <FaUser className="mr-2" />
                <span>
                  {user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-[#3F6592] rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      window.location.href = "/Transitaire/Profil";
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

          <h2 className="text-3xl font-bold text-[#D32F2F] mb-8">
            🚨 Échec du paiement
          </h2>

          <p className="text-gray-600 text-lg mb-8">
            Une erreur est survenue lors de la tentative de paiement. Veuillez réessayer ou contacter le support.
          </p>

          <button
            onClick={() => router.push("/")}
            className="bg-[#3F6592] hover:bg-[#2c4d75] text-white py-2 px-6 rounded-full font-semibold"
          >
            Retour à l'accueil
          </button>
        </div>
      </main>
    </div>
  );
}