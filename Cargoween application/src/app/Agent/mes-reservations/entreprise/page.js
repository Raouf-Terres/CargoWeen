//app/mes-reservations/entreprise/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatBot from '@/components/ChatBot'; 
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { FaBell, FaUser, FaEye } from 'react-icons/fa';

export default function ReceivedReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();


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
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token");
      if (!token || !user?._id) return;

        const response = await fetch(
          `/api/Agent/reservations/by-company?companyId=${user._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
        
        const { data } = await response.json();
setReservations(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  const updateStatus = async (reservationId, status) => {
    try {
      const response = await fetch('/api/Agent/reservations/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, status })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de mise à jour');
      }

      setReservations(prev => 
        prev.map(r => r._id === reservationId ? { ...r, status } : r)
      );
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
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Réessayer
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 bg-[#3F6592]  text-white">
                <h1 className="text-2xl font-bold">Réservations reçues</h1>
                <p className="opacity-90 mt-1">Gérez les demandes de réservation de vos clients</p>
              </div>
              
              {reservations.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune réservation</h3>
                  <p className="mt-1 text-gray-500">Aucune réservation reçue pour le moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse de livraison</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map((reservation) => (
                        <tr key={reservation._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{reservation.userName || 'Inconnu'}</div>
                                <div className="text-sm text-gray-500">{reservation.userId?.email || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{reservation.deliveryAddress}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(reservation.createdAt).toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              reservation.status === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                              reservation.status === 'accepté' ? 'bg-green-100 text-green-800' :
                              reservation.status === 'refusé' ? 'bg-red-100 text-red-800' :
                              'bg-[#3F6592]/10 text-[#3F6592]'
                            }`}>
                              {reservation.status}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <Link 
    href={`/Agent/mes-reservations/entreprise/${reservation._id}`}
    className="text-[#3F6592] hover:text-[#2E4A6D] flex items-center gap-1"
  >
    <FaEye className="inline mr-1" /> Voir
  </Link>
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
