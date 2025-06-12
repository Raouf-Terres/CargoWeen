"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatBot from '@/components/ChatBot'; 
import { FaSearch, FaUser, FaEye, FaTrash, FaFileDownload, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import Toast from "@/components/Toast";



export default function AWBStockList() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [awbs, setAwbs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
const [showAddModal, setShowAddModal] = useState(false);
const [newAWB, setNewAWB] = useState({
  number: "",
  awbType: "Paper AWB",
  comment: "",
});
const [toast, setToast] = useState({ show: false, message: "", type: "success" });
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [awbToDelete, setAwbToDelete] = useState(null);


  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      }

      const resAWB = await fetch("/api/awb");
      const dataAWB = await resAWB.json();
      setAwbs(dataAWB);
    }
    fetchData();
  }, []);

  const filteredAWBs = awbs.filter((awb) =>
    awb.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- EXPORT LOGIQUE ---
  const exportFields = (awb) => ({
    "AWB number": awb.number,
    Used: awb.used ? "Oui" : "Non",
    Type: awb.awbType || "-",
    Commentaire: awb.comment || "-",
  });

  const exportToJSON = () => {
    const data = filteredAWBs.map(exportFields);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "awb_stock.json";
    link.click();
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredAWBs.map(exportFields));
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "awb_stock.csv";
    link.click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredAWBs.map(exportFields));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AWB");
    XLSX.writeFile(workbook, "awb_stock.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const columns = ["AWB number", "Used", "Type", "Commentaire"];
    const data = filteredAWBs.map(awb => [
      awb.number,
      awb.used ? "Oui" : "Non",
      awb.awbType || "-",
      awb.comment || "-"
    ]);

    autoTable(doc, {
      head: [columns],
      body: data,
      theme: "grid",
      headStyles: {
        fillColor: [63, 101, 146],
        textColor: 255,
        fontStyle: "bold"
      }
    });

    doc.save("awb_stock.pdf");
  };
const handleImportExcel = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls (optionnel si tu veux supporter les vieux formats)
  ];

  if (!allowedTypes.includes(file.type)) {
    setToast({ show: true, message: "Fichier non valide. Veuillez importer un fichier Excel (.xlsx)", type: "error" });
    return;
  }

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      let added = 0;
      for (const row of jsonData) {
        if (!row.number) continue;

        const response = await fetch("/api/awb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            number: row.number,
            awbType: row.awbType || "Paper LTA",
            comment: row.comment || "",
            used: false,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          setAwbs((prev) => [...prev, result]);
          added++;
        }
      }

      if (added > 0) {
        setToast({ show: true, message: `${added} LTA importés avec succès`, type: "success" });
      } else {
        setToast({ show: true, message: "Aucun LTA valide trouvé dans le fichier.", type: "warning" });
      }
    } catch (err) {
      setToast({ show: true, message: "Erreur lors de l'importation. Vérifiez le format du fichier.", type: "error" });
      console.error("Erreur importation LTA :", err);
    }
  };

  reader.readAsBinaryString(file);
};


  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`flex-1 bg-[#3F6592] min-h-screen p-6 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="bg-white rounded-3xl p-10 shadow-lg relative">
    <div className="absolute top-10 right-10">
              <div className="relative user-menu">
                <button
                  className="flex items-center bg-[#3F6592] text-white py-1 px-4 rounded-full shadow-md"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <FaUser className="mr-2" />
                  <span>
                    {user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}
                  </span>
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
                        document.cookie =
                          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

          <h1 className="text-2xl font-bold text-[#3F6592] mb-10 mt-10">Liste des LTA</h1>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <div className="relative w-full md:w-auto">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Chercher LTA..."
                className="border border-gray-300 rounded-full pl-10 pr-4 py-2 w-full md:w-72"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3 flex-wrap justify-end">
              <button onClick={exportToJSON} className="border border-gray-300 rounded-full py-2 px-4">Export JSON</button>
              <button onClick={exportToExcel} className="border border-gray-300 rounded-full py-2 px-4">Excel</button>
              <button onClick={exportToCSV} className="border border-gray-300 rounded-full py-2 px-4">CSV</button>
              <button onClick={exportToPDF} className="border border-gray-300 rounded-full py-2 px-4">PDF</button>
<button
  onClick={() => setShowAddModal(true)}
  className="bg-[#0EC953] text-white px-5 py-2 rounded-full font-semibold"
>
  + Ajouter
</button>
<input
  type="file"
  accept=".xlsx"
  onChange={handleImportExcel}
  className="hidden"
  id="import-awb"
/>
<label
  htmlFor="import-awb"
  className="rounded-full py-2 px-4 cursor-pointer bg-yellow-400 text-white hover:bg-yellow-500 transition-colors"
>
  Importer
</label>


            </div>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#3F6592] text-white">
                <tr>
                  <th className="p-3"> Numéro LTA</th>
                  <th className="p-3">Utilisé</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Commentaire</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAWBs.map((awb, i) => (
                  <tr key={awb._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                    <td className="p-3">{awb.number}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-white text-xs ${awb.used ? "bg-red-500" : "bg-green-500"}`}>
                        {awb.used ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="p-3">{awb.awbType || "-"}</td>
                    <td className="p-3">{awb.comment || "-"}</td>
                    <td className="p-3 text-center">
<FaTrash
  className="text-red-500 inline cursor-pointer"
  title="Supprimer"
onClick={() => {
  setAwbToDelete(awb);
  setShowConfirmModal(true);
}}

/>

                    </td>
                  </tr>
                ))}
                {filteredAWBs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">Aucun numéro AWB trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
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
      {toast.show && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast({ ...toast, show: false })}
  />
)}

      {showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] md:w-[400px]">
          <h3 className="text-xl font-bold mb-4 text-[#3F6592]">Ajouter un AWB</h3>

          <input
            type="text"
            placeholder="AWB Number"
            value={newAWB.number}
            onChange={(e) => setNewAWB({ ...newAWB, number: e.target.value })}
            className="w-full p-2 border rounded mb-3"
          />

          <select
            value={newAWB.awbType}
            onChange={(e) => setNewAWB({ ...newAWB, awbType: e.target.value })}
            className="w-full p-2 border rounded mb-3"
          >
            <option>Paper AWB</option>
            <option>EAP</option>
            <option>EAW</option>
          </select>

          <textarea
            placeholder="Commentaire (facultatif)"
            value={newAWB.comment}
            onChange={(e) => setNewAWB({ ...newAWB, comment: e.target.value })}
            className="w-full p-2 border rounded mb-3"
          ></textarea>

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded-full"
              onClick={() => setShowAddModal(false)}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 bg-[#0EC953] text-white rounded-full"
              onClick={async () => {
                const res = await fetch("/api/awb", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...newAWB, used: false }),
                });
                const data = await res.json();
                if (res.ok) {
                  setAwbs((prev) => [...prev, data]);
                  setShowAddModal(false);
                  setNewAWB({ number: "", awbType: "Paper AWB", comment: "" });
                } else {
                  alert("Erreur lors de l’ajout : " + data.message);
                }
              }}
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    )}
    {showConfirmModal && awbToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] md:w-[400px]">
      <h3 className="text-lg font-bold text-[#3F6592] mb-4">
        ⚠️ Confirmation
      </h3>
      <p className="mb-6">Voulez-vous vraiment supprimer ce numéro LTA ?</p>
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 bg-gray-300 rounded-full"
          onClick={() => setShowConfirmModal(false)}
        >
          Annuler
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-full"
          onClick={async () => {
            const res = await fetch(`/api/awb/${awbToDelete._id}`, {
              method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
              setAwbs((prev) => prev.filter((a) => a._id !== awbToDelete._id));
              setToast({ show: true, message: "LTA supprimé avec succès !", type: "success" });
            } else {
              setToast({ show: true, message: "Erreur : " + data.message, type: "error" });
            }
            setShowConfirmModal(false);
            setAwbToDelete(null);
          }}
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );


}
