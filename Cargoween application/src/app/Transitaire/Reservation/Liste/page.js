"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation"; 

import {
  FaUser,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaBox,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

export default function ReservationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
    const router = useRouter(); 
  

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        fetchReservations(data._id);
      }
    };

    const fetchReservations = async (userId) => {
      const res = await fetch(`/api/reservation?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setReservations(data);
    };

    fetchUser();
  }, []);

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main
        className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="bg-white rounded-3xl p-10 shadow-lg relative">
          {/* Bouton utilisateur */}
          <div className="absolute top-10 right-10">
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
                      document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

          <h2 className="text-2xl font-bold text-center text-[#3F6592] mb-10">
            📦 Mes Réservations
          </h2>

          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full border-collapse bg-white text-sm rounded-lg overflow-hidden">
              <thead className="bg-[#3F6592] text-white">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <FaPlaneDeparture className="inline mr-2" />
                    Départ
                  </th>
                  <th className="py-3 px-4 text-left">
                    <FaPlaneArrival className="inline mr-2" />
                    Arrivée
                  </th>
                  <th className="py-3 px-4 text-left">
                    <FaBox className="inline mr-2" />
                    Marchandise
                  </th>
                  <th className="py-3 px-4 text-left">
                    <FaClock className="inline mr-2" />
                    Date
                  </th>
                  <th className="py-3 px-4 text-left">
                    <FaCheckCircle className="inline mr-2" />
                    Statut
                  </th>
                  <th className="py-3 px-4 text-left">Détails</th>

                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500"
                    >
                      Aucune réservation trouvée.
                    </td>
                  </tr>
                ) : (
                  reservations.map((res, i) => (
                    <tr
                      key={res._id}
                      className={`${
                        i % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } border-b`}
                    >
                      <td className="py-3 px-4">{res.from || "N/A"}</td>
                      <td className="py-3 px-4">{res.to || "N/A"}</td>
                      <td className="py-3 px-4">
                        {res.marchandise?.description || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(res.departureDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        {res.etat || "En attente"}
                      </td>
                      <td className="py-3 px-4">
          <button
            onClick={() => router.push(`/Transitaire/Reservation/${res._id}`)}
            className="text-sm text-white bg-[#3F6592] hover:bg-[#2c4e75] px-4 py-2 rounded-full transition"
          >
            Voir détails
          </button>
        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
