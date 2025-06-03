import React, { useState } from 'react';
import { FaBoxOpen, FaWeightHanging, FaPallet, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function CargoDetails({ marchandise }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (!marchandise || !marchandise.items) {
    return (
      <div className="border-2 border-blue-500 rounded-xl bg-white shadow-lg p-4 w-full max-w-md text-sm text-[#3F6592] mt-4">
        <p>Aucune marchandise à afficher.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(marchandise.items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = marchandise.items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="border-2 border-blue-500 rounded-xl bg-white shadow-lg p-5 w-full max-w-md text-sm text-[#3F6592] space-y-4">
      
      <div className="flex items-center gap-2 border-b pb-2">
        <FaBoxOpen className="text-xl" />
        <h3 className="text-lg font-bold">Détails de la marchandise</h3>
      </div>

      <div className="space-y-3">
        {currentItems.map((item, index) => (
          <div key={startIndex + index} className="p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold mb-1">Pièce #{startIndex + index + 1}</div>
            <div className="grid grid-cols-2 gap-2">
              <p className="flex items-center gap-1"><FaPallet /> Type : {item.type}</p>
              <p className="flex items-center gap-1"><FaWeightHanging /> Poids : {item.poids} kg</p>
              <p>Dimensions : {item.longueur} x {item.largeur} x {item.hauteur} cm</p>
              <p>Quantité : {item.quantite}</p>
              <p>HS Code : {item.hsCode}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-2 text-sm">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
            title="Page précédente"
          >
            <FaChevronLeft />
          </button>
          <span className="text-[#3F6592] font-semibold">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
            title="Page suivante"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      <div className="border-t pt-3 text-sm font-semibold">
        Poids total :{" "}
        {marchandise.items.reduce((acc, item) => acc + ((item.poids || 0) * (item.quantite || 1)), 0)} kg
      </div>
      <div className="text-xs text-gray-500">
        Nombre total de pièces : {marchandise.pieces}
      </div>
    </div>
  );
}
