"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Recu from "@/components/Recu";
import Sidebar from "@/components/Sidebar";
import { FaUser } from "react-icons/fa";
import AgentSuggestionModal from "@/components/AgentSuggestionModal";

export default function PaymentSuccessPage() {
  const [data, setData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const html2pdf = typeof window !== "undefined" ? require("html2pdf.js") : null;
const [showSuggestion, setShowSuggestion] = useState(false);
const router = useRouter();
 useEffect(() => {
  if (data) {
    downloadRecu();
  }
}, [data]);



  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentRef = params.get("payment_ref");
    fetch(`/api/reservation/by-payment/${paymentRef}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Erreur fetch reçu :", err));
  }, []);

const downloadRecu = () => {
  if (!data || !data.user) return;

  const element = document.getElementById("recu");
  if (!element) return;

  const filename = `reçu de réservation - ${data.user.firstname} ${data.user.lastname}.pdf`;
  html2pdf()
    .from(element)
    .save(filename)
    .then(() => {
      setShowSuggestion(true); // afficher la pop-up après génération du PDF
    });
};

 
  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main
        className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="bg-white rounded-3xl p-16 shadow-lg relative text-center">
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

          <h2 className="text-4xl font-bold text-green-600 mb-6">✅ Paiement réussi</h2>
          <p className="text-lg text-[#3F6592] mb-4">
            Merci pour votre réservation. Le téléchargement de votre reçu est en cours...
          </p>
          {data && (
            <button
              onClick={downloadRecu}
              className="bg-[#3F6592] text-white px-6 py-2 rounded-full shadow hover:bg-blue-700"
            >
              📄 Retélécharger le reçu
            </button>
          )}
          {data && <div className="hidden"><Recu data={data} /></div>}
        </div>
      </main>
      {showSuggestion && (
  <AgentSuggestionModal
    onClose={() => setShowSuggestion(false)}
    onConfirm={() => {
      setShowSuggestion(false);
      router.push("Agent/recommandation"); // redirige vers une page à créer
    }}
  />
)}
    </div>
  );
}
