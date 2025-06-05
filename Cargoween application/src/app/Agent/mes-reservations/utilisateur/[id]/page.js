'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaFilePdf, FaDownload, FaPrint, FaUser } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar';

export default function ReservationDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const handleDownload = async (filePath, fileName) => {
    try {
      if (!filePath) {
        throw new Error('Chemin du fichier non disponible');
      }

      // Vérifier si c'est un chemin local ou une URL complète
      const fullPath = filePath.startsWith('http') ? filePath : `${window.location.origin}${filePath}`;

      // Créer un lien temporaire et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = fullPath;
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert(`Erreur lors du téléchargement: ${error.message}`);
    }
  };
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await fetch(`/api/Agent/reservations/${id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);
        if (!data.success) throw new Error(data.message);

        setReservation(data.reservation);
      } catch (err) {
        setError(err.message);
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onToggle={setSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="p-8">
            <div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3F6592]"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onToggle={setSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="p-8">
            <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg shadow-md mt-10">
              <div className="flex items-center text-red-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium">Erreur</h3>
              </div>
              <p className="mt-2 text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Système de Recommandation de Transitaire</h1>

            <div className="relative">
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 bg-[#3F6592] text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold">Détails de la réservation</h1>
                    <p className="opacity-90 mt-1">#{reservation._id.toString()}</p>
                  </div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    reservation.status === 'livrée' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'accepté' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'refusé' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reservation.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <button 
                    onClick={() => router.push('/Agent/mes-reservations')}
                    className="flex items-center gap-2 bg-[#3F6592] text-white hover:bg-[#2E4A6D] px-4 py-2 rounded-lg transition-colors shadow-md"
                  >
                    <FaArrowLeft /> Retour
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrint}
                      className="flex items-center bg-white border border-[#3F6592] text-[#3F6592] hover:bg-[#3F6592]/10 py-2 px-4 rounded-lg shadow transition-colors"
                    >
                      <FaPrint className="mr-2" /> Imprimer
                    </button>
                    
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations de base</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Date de réservation</p>
                        <p className="font-medium">{formatDate(reservation.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Société</p>
                        <p className="font-medium">{reservation.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{reservation.companyEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Adresse de livraison</p>
                        <p className="font-medium">{reservation.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Détails tarifaires</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="font-medium">{reservation.distanceLivraison} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prix par km</p>
                        <p className="font-medium">{reservation.prixKm} €/km</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prix d'arrivée</p>
                        <p className="font-medium">{reservation.prixArrivee} €</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Douane</p>
                        <p className="font-medium">{reservation.douane} €</p>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="mt-1 text-lg font-bold text-[#3F6592]">{reservation.tarifTotal} €</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Documents</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservation.files?.facture && (
                      <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500 text-2xl" />
                          <div>
                            <p className="font-medium">Facture</p>
                            <p className="text-sm text-gray-500">Document facture</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(reservation.files.facture, 'facture.pdf')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}

{reservation.files?.recueAvion && (
                      <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500 text-2xl" />
                          <div>
                            <p className="font-medium">Recue d'Avion</p>
                            <p className="text-sm text-gray-500">Document d'Avion</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(reservation.files.recueAvion, 'recueAvion.pdf')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}
                    {reservation.files?.bonLivraison && (
                      <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500 text-2xl" />
                          <div>
                            <p className="font-medium">Bon de livraison</p>
                            <p className="text-sm text-gray-500">Document bon de livraison</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(reservation.files.bonLivraison, 'bon_livraison.pdf')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}

                    {reservation.files?.euri && (
                      <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500 text-2xl" />
                          <div>
                            <p className="font-medium">EURI</p>
                            <p className="text-sm text-gray-500">Document EURI</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(reservation.files.euri, 'euri.pdf')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}

                    {reservation.files?.fds && (
                      <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500 text-2xl" />
                          <div>
                            <p className="font-medium">FDS</p>
                            <p className="text-sm text-gray-500">Fiche de données de sécurité</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(reservation.files.fds, 'fds.pdf')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}

                    {reservation.files?.pdfInitial && (
                      <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500 text-2xl" />
                          <div>
                            <p className="font-medium">PDF Initial</p>
                            <p className="text-sm text-gray-500">Document original</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(reservation.files.pdfInitial, 'document_initial.pdf')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}

                    {reservation.files?.autres?.length > 0 && reservation.files.autres.map((filePath, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500 text-2xl" />
                          <div>
                            <p className="font-medium">Document supplémentaire {index + 1}</p>
                            <p className="text-sm text-gray-500">Autre document</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(filePath, `document_${index + 1}.pdf`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DocumentCard({ document, label, onDownload }) {
  return (
    <div
      className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[#3F6592] transition-colors cursor-pointer shadow-sm"
      onClick={() => onDownload(document)}
    >
      <FaFilePdf className="text-red-500 text-xl mr-4" />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 truncate" style={{ maxWidth: '200px' }}>
          {document.name}
        </p>
      </div>
    </div>
  );
}
