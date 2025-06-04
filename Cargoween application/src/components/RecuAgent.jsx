import React from "react";
import { FaBox, FaTruck, FaMoneyBillWave, FaFileInvoice, FaMapMarkerAlt, FaUser  } from "react-icons/fa";

const RecuAgent = ({ data }) => {
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg" id="recu">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#3F6592]">Reçu de Réservation</h1>
        <p className="text-gray-500">Numéro: {data._id}</p>
        <p className="text-gray-500">Date: {new Date(data.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Informations client */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaUser className="mr-2 text-[#3F6592]" />
          Informations Client
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Nom:</span> {data.userName}</p>
            <p><span className="font-medium">Email:</span> {data.userEmail}</p>
          </div>
          <div>
            <p><span className="font-medium">Téléphone:</span> {data.userPhone}</p>
            <p><span className="font-medium">ID Client:</span> {data.userId}</p>
          </div>
        </div>
      </div>

      {/* Informations société */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaTruck className="mr-2 text-[#3F6592]" />
          Société de Transport
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Nom:</span> {data.companyName}</p>
            <p><span className="font-medium">ID Société:</span> {data.companyId}</p>
          </div>
          <div>
            <p className="flex items-start">
              <FaMapMarkerAlt className="mr-2 mt-1 text-[#3F6592]" />
              <span>{data.deliveryAddress}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Détails de la réservation */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaBox className="mr-2 text-[#3F6592]" />
          Détails de la Réservation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p><span className="font-medium">Distance:</span> {data.distanceLivraison} km</p>
            <p><span className="font-medium">Prix/km:</span> {data.prixKm} €</p>
          </div>
          <div>
            <p><span className="font-medium">Frais arrivée:</span> {data.prixArrivee} €</p>
            <p><span className="font-medium">Frais douane:</span> {data.douane} €</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-bold text-lg">
              <span className="font-medium">Total:</span> {data.tarifTotal} €
            </p>
          </div>
        </div>
      </div>

      {/* Statut et paiement */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaMoneyBillWave className="mr-2 text-[#3F6592]" />
          Paiement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Statut:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                data.paymentStatus === "Payée" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {data.paymentStatus}
              </span>
            </p>
            <p><span className="font-medium">Référence paiement:</span> {data.paymentRef}</p>
          </div>
          <div>
            <p><span className="font-medium">Date réservation:</span> {new Date(data.createdAt).toLocaleString()}</p>
            <p><span className="font-medium">Dernière mise à jour:</span> {new Date(data.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      

      {/* Pied de page */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Merci pour votre confiance !</p>
        <p>Pour toute question, contactez-nous à contact@cargoween.com</p>
      </div>
    </div>
  );
};

export default RecuAgent;