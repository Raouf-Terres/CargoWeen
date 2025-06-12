// app/mes-reservations/entreprise/[id]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ChatBot from '@/components/ChatBot'; 
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { FaUser, FaFilePdf, FaDownload, FaArrowLeft, FaPrint, FaLock } from 'react-icons/fa';

export default function ReservationDetail() {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { id } = useParams();

 

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

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        //const user = JSON.parse(localStorage.getItem('user'));
        //if (!user?._id) {
        //  router.push('/');
        //  return;}

        const response = await fetch(`/api/Agent/reservations/by-company/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération');
        }

        setReservation(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, router]);


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

  const handlePrint = () => {
    window.print();
  };

  const updateStatus = async (status) => {
    try {
      const response = await fetch('/api/Agent/reservations/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: id, status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de mise à jour');
      }

      setReservation(prev => ({ ...prev, status }));
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg shadow-md mt-10">
        <div className="flex items-center text-red-600">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium">Erreur</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={() => router.push('/Agent/mes-reservations/entreprise')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour aux réservations
        </button>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg shadow-md mt-10">
        <div className="flex items-center text-yellow-600">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium">Avertissement</h3>
        </div>
        <p className="mt-2 text-yellow-700">Réservation introuvable</p>
        <button
          onClick={() => router.push('/Agent/mes-reservations/entreprise')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour aux réservations
        </button>
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 bg-[#3F6592] text-white flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Détails de la réservation</h1>
                  <p className="opacity-90 mt-1">Informations complètes sur la réservation</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/Agent/mes-reservations/entreprise')}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaArrowLeft /> Retour
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg shadow hover:bg-gray-50"
                  >
                    <FaPrint className="mr-2" /> Imprimer
                  </button></div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section Informations client */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations client</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom du client</p>
                      <p className="font-medium">{reservation.userName || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{reservation.userEmail || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Transitaire Téléphone</p>
                      <p className="font-medium">{reservation.userPhone || 'Non spécifié'}</p>
                    </div>
                  </div>
                </div>

                {/* Section Livraison */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Détails de livraison</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Adresse de livraison</p>
                      <p className="font-medium">{reservation.deliveryAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date de réservation</p>
                      <p className="font-medium">
                        {new Date(reservation.createdAt).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${reservation.status === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                          reservation.status === 'accepté' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'refusé' ? 'bg-red-100 text-red-800' :
                              reservation.status === 'livré' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Documents */}
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

                {/* Section Tarifs */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Détails tarifaires</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Distance</p>
                      <p className="font-medium">{reservation.distanceLivraison} km</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Prix par km</p>
                      <p className="font-medium">{reservation.prixKm} €/km</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Frais d'arrivée</p>
                      <p className="font-medium">{reservation.prixArrivee} €</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Frais de douane</p>
                      <p className="font-medium">{reservation.douane} €</p>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                      <p className="text-gray-800 font-semibold">Total</p>
                      <p className="text-blue-600 font-bold">{reservation.tarifTotal} €</p>
                    </div>
                  </div>
                </div>

                {/* Section Actions */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modifier le statut</label>
                      <select
                        value={reservation.status}
                        onChange={(e) => updateStatus(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="en attente">En cours</option>
                        <option value="livré">Livré</option>
                      </select>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* ChatBot flottant */}
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <ChatBot />
        </div>
    </div>
  );
}
