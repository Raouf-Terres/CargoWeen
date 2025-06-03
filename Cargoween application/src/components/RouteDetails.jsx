import React from 'react';
import {
  FaRegClock,
  FaMapMarkerAlt,
  FaPlane,
  FaBox,
  FaEnvelope,
  FaCopy,
} from 'react-icons/fa';

export default function RouteDetails({ reservation }) {
  const airlineLogo = `https://images.kiwi.com/airlines/64/${reservation.airline}.png`;

  const formatDate = (date) =>
    new Date(date).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

const calcFlightDuration = (start, end) => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diff = d2 - d1;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
};
    const duration = calcFlightDuration(reservation.departureDate, reservation.arrivalDate);

  return (
    <div className="border-2 border-blue-500 rounded-2xl bg-white shadow-lg p-6 w-full max-w-md text-sm text-[#3F6592] space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="text-xl font-bold">🗺️ Détails de l’itinéraire</h3>
        <div className="flex gap-3 text-lg text-blue-500">
          <button title="Envoyer"><FaEnvelope /></button>
          <button title="Copier"><FaCopy /></button>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="flex justify-between text-xs bg-blue-50 rounded-lg px-4 py-2">
<span className="flex gap-1 items-center bg-white px-2 py-1 rounded-md shadow text-xs font-semibold">
  <FaRegClock /> {duration}
</span>

        <span className="flex gap-1 items-center"><FaMapMarkerAlt /> {reservation.stops || "0 escale"}</span>
        <span className="flex gap-1 items-center"><FaBox /> {reservation.distance || 0} km</span>
      </div>

      {/* Timeline visuelle */}
<div className="relative pl-5 before:absolute before:top-0 before:bottom-0 before:left-[7px] before:w-[2px] before:bg-blue-400 space-y-6">
        {/* Départ */}
        <div className="relative">
          <div className="absolute -left-[10px] top-1 bg-blue-500 h-4 w-4 rounded-full z-10  ml-1"></div>
          <div>
<div className="text-sm pl-2">
  <strong className="text-base tracking-wide  ml-2">{reservation.from}</strong>
</div>
            <p className="flex items-center gap-1 text-xs text-gray-600">
              <FaPlane /> {formatDate(reservation.departureDate)}
            </p>
            <p className="text-[11px] text-gray-400">{reservation.flightNumber || "MS844"} | Numéro de vol</p>
          </div>
        </div>
        

        {/* Escales */}
        {(reservation.steps || []).map((step, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[10px] top-1 border border-blue-400 bg-white text-[10px] text-blue-600 rounded-full h-5 w-5 flex items-center justify-center font-bold">↪</div>
            <div>
              <p className="font-bold">{step.airport}</p>
              <p className="flex items-center gap-1 text-xs text-gray-600">
                <FaPlane /> {formatDate(step.date)}
              </p>
              <p className="text-[11px] text-gray-400">{step.aircraft} | {step.type}</p>
            </div>
          </div>
        ))}

        {/* Arrivée */}
        <div className="relative">
          <div className="absolute -left-[10px] top-1 bg-blue-500 h-4 w-4 rounded-full z-10  ml-1"></div>
          <div>
<div className="text-sm pl-2">
  <strong className="text-base tracking-wide  ml-2">{reservation.to}</strong>
</div>
            <p className="flex items-center gap-1 text-xs text-gray-600">
              <FaPlane /> {formatDate(reservation.arrivalDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Détails tarifaires */}
      <div className="bg-[#3F6592] text-white rounded-xl p-4 text-xs space-y-1 font-medium shadow-md mt-6 relative">


  <div className="flex justify-between">
    <span>💰 ALL IN Rate</span>
    <span>{reservation.tarif.toFixed(2)} EUR/KG</span>
  </div>
  <div className="flex justify-between">
    <span>⛽ Fuel Surcharge</span>
    <span>20 EUR</span>
  </div>
  <div className="flex justify-between border-t border-white pt-2 font-bold text-white">
    <span>Total ALL IN Cost</span>
    <span>{(reservation.tarif * reservation.totalWeight + 50 + 30 + 20).toFixed(2)} €</span>
  </div>
</div>
{/* Logo compagnie – bien centré et plus grand */}
<div className="flex justify-center mt-8">
  <div className="bg-white p-3 rounded-xl shadow-sm">
    <img
      src={airlineLogo}
      alt="Airline Logo"
      className="h-20 w-auto object-contain"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "/fallback-logo.png";
      }}
    />
  </div>
</div>



    </div>
  );
}
