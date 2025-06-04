"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Recu from "@/components/RecuAgent";
import Sidebar from "@/components/Sidebar";
import { FaUser } from "react-icons/fa";
import dynamic from 'next/dynamic';
import RecuAgent from "@/components/RecuAgent";
// Chargement dynamique de html2pdf pour éviter les problèmes SSR

export default function PaymentSuccessPage() {
  const [data, setData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const router = useRouter();
  const recuRef = useRef(null);

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
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentRef = params.get("payment_ref");
    
    if (paymentRef) {
      fetch(`/api/Agent/receipt/${paymentRef}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          // Stocker les données pour pouvoir les réutiliser
          localStorage.setItem('lastReceiptData', JSON.stringify(data));
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (data && !pdfGenerated && recuRef.current) {
      generatePdf();
    }
  }, [data, pdfGenerated]);

 const generatePdf = async () => {
  if (!data || !recuRef.current) return;

  try {
    const html2pdf = (await import("html2pdf.js")).default;

    const element = recuRef.current;
    const filename = `reçu_de_réservation_${data._id || Date.now()}.pdf`;

    // Options améliorées pour html2pdf
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Temporairement afficher le contenu pour la génération
    element.style.position = 'relative';
    element.style.left = '0';
    
    await html2pdf()
      .set(opt)
      .from(element)
      .save();

    // Remettre le style original
    element.style.position = 'fixed';
    element.style.left = '-10000px';

    setPdfGenerated(true);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
  }
};
  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${
        sidebarOpen ? "ml-64" : "ml-20"
      }`}>
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
                    onClick={() => router.push("/Transitaire/Profil")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Modifier profil
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      router.push("/login");
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
            {pdfGenerated ? "Votre reçu a été généré avec succès!" : "Génération de votre reçu en cours..."}
          </p>
          
          <button
            onClick={generatePdf}
            className="bg-[#3F6592] text-white px-6 py-2 rounded-full shadow hover:bg-blue-700"
          >
            {pdfGenerated ? "📄 Télécharger à nouveau" : "📄 Générer le reçu"}
          </button>
          
          {/* Composant Recu masqué mais rendu */}
         <div style={{ position: 'fixed', left: '-10000px', top: 0 }} ref={recuRef}>
  {data && <RecuAgent data={data} />}
</div>
        </div>
      </main>
    </div>
  );
}