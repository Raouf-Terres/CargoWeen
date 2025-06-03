import React from "react";

export default function AgentSuggestionModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center">
        <h2 className="text-2xl font-bold text-[#3F6592] mb-4">
          Réserver un agent transitaire ?
        </h2>
        <p className="text-gray-700 mb-6">
          Souhaitez-vous qu’un agent transitaire prenne en charge la livraison à l’adresse indiquée ?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Oui
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Non
          </button>
        </div>
      </div>
    </div>
  );
}