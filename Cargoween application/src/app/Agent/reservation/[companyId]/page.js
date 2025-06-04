'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import { FaUser, FaMapMarkerAlt, FaPhone, FaEuroSign, FaRoad, FaInfoCircle, FaCheck } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// Configuration de Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Créer une icône personnalisée
const createCustomIcon = () => {
  return new L.Icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function ReservationPage({ params }) {
  const router = useRouter();
  const { companyId } = use(params);
  const searchParams = useSearchParams();

  // États pour les données de la société
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyCoordinates, setCompanyCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const reservationId = searchParams.get('reservationId');
  // États pour la réservation
  const [files, setFiles] = useState({
    recueAvion: null,
    facture: null,
    bonLivraison: null,
    euri: null,
    fds: null,
    autres: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Session invalide");
      }

      const data = await res.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      console.error("Erreur d'authentification:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  checkAuth();

  const handleClickOutside = (e) => {
    if (!e.target.closest(".user-menu")) {
      setUserMenuOpen(false);
    }
  };
  
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedout", handleClickOutside);
}, [router]);


  useEffect(() => {
    if (!searchParams) return;

    // Récupération des données passées par l'URL
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        setCompanyData(decodedData);
        setDeliveryAddress(decodedData.deliveryAddress || '');
        if (decodedData.pdfFile) {
          setPdfFile(decodedData.pdfFile);
        }

      } catch (error) {
        console.error("Erreur de décodage des données", error);
      }
    }

    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/Agent/companies?id=${companyId}`);
        if (!response.ok) throw new Error('Société non trouvée');

        const result = await response.json();
        const details = {
          ...result.data,
          DistanceToAirport: result.data.DistanceToAirport || result.data['Distance to Airport (km)'] || 0,
          DeliveryDistance: result.data.DeliveryDistance || result.data['Delivery Distance (km)'] || 0,
          TarifTotal: result.data.TarifTotal || result.data['Tarif Total (Euro)'] || 0,
        };

        setCompanyDetails(details);

        // Géocodage de l'adresse
        if (details.PostalAddress || details["address"]) {
          const address = encodeURIComponent(details.PostalAddress || details["address"]);
          const geocodingResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
          );
          const geocodingData = await geocodingResponse.json();

          if (geocodingData.length > 0) {
            setCompanyCoordinates({
              lat: parseFloat(geocodingData[0].lat),
              lng: parseFloat(geocodingData[0].lon)
            });
          } else {
            console.warn('Adresse non trouvée via le géocodage');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId, searchParams]);

  const mergedCompanyDetails = companyDetails
    ? { ...companyDetails, ...companyData }
    : null;

  const handleFileChange = (name) => (e) => {
    if (name === 'autres') {
      setFiles(prev => ({ ...prev, autres: [...e.target.files] }));
    } else {
      setFiles(prev => ({ ...prev, [name]: e.target.files[0] }));
    }
  };

  const handleSubmitReservation = async () => {
  // Get user from localStorage
  

  try {
    if (!user) {
      setSubmitError('Chargement des informations utilisateur...');
    return;
  }

    // Check required files
    if (!files.facture || !files.bonLivraison || !files.recueAvion) {
      setSubmitError('Les documents Facture, Bon de livraison et récue avion sont obligatoires');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();

    // Add company data
    formData.append('companyData', JSON.stringify({
      ...mergedCompanyDetails,
      deliveryAddress: mergedCompanyDetails.deliveryAddress || deliveryAddress,
    }));

    // Add user data
    formData.append('userId', user._id);
    formData.append('userName', user.company || `${user.firstname} ${user.lastname}`);
    formData.append('userEmail', user.email);
    formData.append('userPhone', user.phone);
    formData.append('deliveryAddress', deliveryAddress);

    // Add files
    if (files.pdfFile) formData.append('pdfInitial', files.pdfFile);
    if (files.facture) formData.append('facture', files.facture);
    if (files.bonLivraison) formData.append('bonLivraison', files.bonLivraison);
    if (files.recueAvion) formData.append('recueAvion', files.recueAvion);
    if (files.euri) formData.append('euri', files.euri);
    if (files.fds) formData.append('fds', files.fds);

    files.autres.forEach(file => {
      if (file) formData.append('autres', file);
    });

    const response = await fetch('/api/Agent/reservations', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la réservation');
    }

    window.location.href = result.paymentUrl;
  } catch (err) {
    setSubmitError(err.message);
    setIsSubmitting(false);
  }
};

 

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

          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="text-center py-8">
                <img
                  src="/camion.gif"
                  alt="Chargement en cours"
                  className="mx-auto h-24 w-24 object-contain"
                /><p className="mt-4 text-gray-600">Chargement des détails de la société...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                <p>{error}</p>
              </div>
            ) : companyDetails ? (
              <div className="flex flex-col">
                {/* En-tête */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">{companyDetails.CompanyName || companyDetails["company"]}</h1>
                    <p className="text-gray-600 mt-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      {companyDetails.PostalAddress || companyDetails["address"]}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Recommandée
                  </span>
                </div>

                {/* Contenu principal en deux colonnes */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Colonne gauche - Informations */}
                  <div className="lg:w-1/2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                          <FaInfoCircle className="mr-2 text-blue-500" />
                          Informations générales
                        </h3>
                        <div className="space-y-2">
                          <p><span className="font-medium">Téléphone:</span> {companyDetails.Phone || companyDetails["phone"] || 'Non disponible'}</p>
                          <p><span className="font-medium">Email:</span> {companyDetails.Email || companyDetails["email"] || 'Non disponible'}</p>
                          <p><span className="font-medium">Site web:</span> {companyDetails.Website || companyDetails["website"] ? (
                            <a
                              href={companyDetails.Website || companyDetails["website"]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {companyDetails.Website || companyDetails["website"]}
                            </a>
                          ) : 'Non disponible'}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                          <FaEuroSign className="mr-2 text-green-500" />
                          Tarifs
                        </h3>
                        <div className="space-y-2">
                          <p><span className="font-medium">Prix par km:</span> {companyDetails.PrixKM || companyDetails["Prix KM"]} €</p>
                          <p><span className="font-medium">Frais d'arrivée:</span> {companyDetails.PrixArrivee || companyDetails["prix arrivée"]} €</p>
                          <p><span className="font-medium">Frais de douane:</span> {companyDetails.Douane || companyDetails.douane} €</p>
                          <p>
                            <span className="font-medium">Aéroport-adresse livrées:</span>
                            {mergedCompanyDetails?.DeliveryDistance?.toFixed(2) ?? 'Non disponible'} km
                          </p>
                          <p className="font-medium text-lg mt-3">
                            Tarif estimé total: <span className="text-green-600">
                              {mergedCompanyDetails?.TarifTotal?.toFixed(2) ?? 'Non disponible'} €
                            </span>
                          </p>
                          {deliveryAddress && (
                            <p className="delivery-address">
                              <strong>Adresse de livraison :</strong> {deliveryAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne droite - Carte */}
                  <div className="lg:w-1/2 h-full">
                    <div className="bg-gray-50 p-4 rounded-lg h-full sticky top-4">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                        Localisation de la société
                      </h3>
                      <div className="h-96 rounded-lg overflow-hidden">
                        <MapContainer
                          center={companyCoordinates || [36.8, 10.1]}
                          zoom={companyCoordinates ? 15 : 10}
                          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          {companyCoordinates && (
                            <Marker
                              position={[companyCoordinates.lat, companyCoordinates.lng]}
                              icon={createCustomIcon()}
                            >
                              <Popup>
                                <div className="font-semibold">
                                  {companyDetails.CompanyName || companyDetails["Company Name"]}
                                </div>
                                <div className="text-sm">
                                  {companyDetails.PostalAddress || companyDetails["Postal Address"]}
                                </div>
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                      </div>
                      {!companyCoordinates && (
                        <p className="text-sm text-gray-500 mt-2">
                          Localisation exacte non disponible
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Documents et Réservation */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-lg mb-4">Documents requis</h3>

                  {/* Messages d'état */}
                  {submitError && (
                    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                      <p>{submitError}</p>
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 flex items-center">
                      <FaCheck className="mr-2" />
                      <p>Réservation confirmée avec succès! Redirection en cours...</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Facture */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facture <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        required
                        onChange={handleFileChange('facture')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>

                    {/* Bon de livraison */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bon de livraison <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        required
                        onChange={handleFileChange('bonLivraison')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>

                    {/* Récue de paiement d'avion */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reçu de paiement d'avion <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        required
                        onChange={handleFileChange('recueAvion')}
                        className="block w-full text-sm text-gray-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-md file:border-0
      file:text-sm file:font-semibold
      file:bg-blue-50 file:text-blue-700
      hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>

                    {/* EURI */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        EURI (Optionnel)
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange('euri')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>

                    {/* FDS */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FDS (Optionnel)
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange('fds')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>

                    {/* Autres documents */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Autres documents (Optionnel)
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange('autres')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>



                  <h3 className="font-semibold text-lg mb-4">Procéder à la réservation</h3>
                  <button
                    onClick={handleSubmitReservation}
                    disabled={isSubmitting || submitSuccess}
                    className={`bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors ${isSubmitting || submitSuccess ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : submitSuccess ? (
                      'Réservation confirmée'
                    ) : (
                      'Confirmer la réservation'
                    )}
                  </button>
                </div>
              </div>

            ) : (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                <p>Aucune information disponible pour cette société.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}