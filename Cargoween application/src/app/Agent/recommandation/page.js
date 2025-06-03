"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Ajout de l'import router
import { FaUser, FaSearch } from 'react-icons/fa';
import {  FiLock, FiUser } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';
import FileUpload from '@/components/FileUpload';
import AddressInput from '@/components/AddressInput';
import RecommendationResult from '@/components/RecommendationResult';
import Link from 'next/link';

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [airportData, setAirportData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
   const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const controllerRef = useRef(null);
  const router = useRouter(); // Initialisation du router
  const [user, setUser] = useState(null);

  
  const handleLogout = () => {
    localStorage.removeItem('user');
    // Rediriger vers la page de login
    router.push('/login');
  };


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
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      setError('Veuillez fournir un fichier PDF');
      return;
    }

    if (!deliveryAddress) {
      setError('Veuillez saisir une adresse de livraison');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('deliveryAddress', deliveryAddress);

      formData.append('pdfFileName', pdfFile.name);

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setRecommendations({
        companies: result.data.companies || [],
        airportCoords: result.data.airportCoords || null
      });

    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(
        err.name === 'AbortError'
          ? 'Le traitement a pris trop de temps (30 minutes max)'
          : err.message || 'Erreur lors du traitement'
      );
    } finally {
      setLoading(false);
      controllerRef.current?.abort();
    }
  };

  // Fonction pour gérer la sélection d'une compagnie
  const handleSelectCompany = async (company) => {
  try {
    setLoading(true);
    
    const formData = new FormData();
    
    // Ajouter le PDF directement au FormData
    if (pdfFile instanceof File) {
      formData.append('pdfInitial', pdfFile);
    }

    formData.append('companyData', JSON.stringify({
      id: company.id,
      CompanyName: company.name,
      TarifTotal: company.price,
      DeliveryDistance: company.deliveryDistance,
      PrixKM: company.pricePerKm,
      PrixArrivee: company.basePrice,
      Douane: company.customsFee,
      deliveryAddress
    }));
    
    formData.append('userId', user.id);
    formData.append('userName', user.name);
    formData.append('userEmail', user.email);
    formData.append('userPhone', user.phone);

    const response = await fetch('/api/reservations', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create reservation');
    }

    router.push(`/reservation/${result.reservationId}`);
  } catch (error) {
    console.error('Reservation error:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarOpen} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Système de Recommandation de Transitaire</h1>

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

          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
  {/* Document PDF */}
  <div className="md:col-span-4 h-full">
    <label className="text-lg font-semibold text-gray-700">Document PDF</label>
    <div className="h-[80px] flex items-center">
      <FileUpload onFileSelect={(file) => setPdfFile(file)} />
    </div>
  </div>

  {/* Adresse de Livraison */}
  <div className="md:col-span-5 h-full">
    <label className="text-lg font-semibold text-gray-700">Adresse de Livraison</label>
    <div className="h-[80px]">
      <AddressInput onAddressChange={setDeliveryAddress} />
    </div>
  </div>

  {/* Bouton */}
  <div className="md:col-span-3 h-full flex items-end">
    <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center justify-center py-3 px-6 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <FaSearch className="mr-2" />
                       Rechercher
                      </>
                    )}
                  </button>
  </div>
</div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Erreur : {error}</span>
                </div>
                {airportData && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer text-red-600">Détails techniques</summary>
                    <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-auto">
                      {JSON.stringify(airportData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>

          {recommendations && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <RecommendationResult
                recommendations={recommendations}
                deliveryAddress={deliveryAddress}
                airportData={airportData}
                onSelectCompany={handleSelectCompany} // Passer la fonction de sélection
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}