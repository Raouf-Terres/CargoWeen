"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebare-admin";
import { FaEnvelope, FaUser, FaPhone,FaBriefcase,FaBuilding ,FaGlobe, FaCity,FaHome, FaBarcode ,FaIdBadge ,  FaEye, FaEdit, FaTrash, FaSearch, FaFileDownload, FaUserFriends, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import * as XLSX from "xlsx"; // Pour l'export Excel
import Papa from "papaparse"; // Pour l'export CSV
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"	

export default function PageCompagnies() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State pour la recherche dynamique
  const [showDetails, setShowDetails] = useState(false); // Pour afficher la pop-up de détails
  const [showEdit, setShowEdit] = useState(false); // Pour afficher la pop-up de modification
  const [user, setUser] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false); 
  const [airlines, setAirlines] = useState([]);
  const [selectedAirline, setSelectedAirline] = useState(null); // Compagnie aérienne sélectionnée
  const [selectedAirlineIds, setSelectedAirlineIds] = useState([]);

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

    const fetchAirlines = async () => {
        try {
          const res = await fetch("/api/Airline");
          const data = await res.json();
          if (res.ok) {
            setAirlines(data);
          }
        } catch (err) {
          console.error("Erreur chargement des compagnies aériennes :", err);
        }
      };
    

    fetchUser();
    fetchAirlines();
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
  

  // Fonction de recherche dynamique
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fonction de suppression
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette compagnie aérienne ?")) {
      const response = await fetch(`/api/Airline/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        setAirlines((prevState) => prevState.filter((airline) => airline._id !== id));
        alert(data.message);
      } else {
        alert(data.message || "Erreur lors de la suppression.");
      }
    }
  };

    // Filtrage des compagnies aériennes
    const filteredAirlines = airlines.filter((a) => {
        const term = searchTerm.toLowerCase();
      
        return (
          new Date(a.createdAt).toLocaleDateString().toLowerCase().includes(term) ||
          (a.firstname && a.firstname.toLowerCase().includes(term)) ||
          (a.lastname && a.lastname.toLowerCase().includes(term)) ||
          (a.email && a.email.toLowerCase().includes(term)) ||
          (a.phone && a.phone.toLowerCase().includes(term)) ||
          (a.function && a.function.toLowerCase().includes(term)) ||
          (a.company && a.company.toLowerCase().includes(term)) ||
          (a.country && a.country.toLowerCase().includes(term)) ||
          (a.city && a.city.toLowerCase().includes(term)) ||
          (a.address && a.address.toLowerCase().includes(term)) ||
          (a.postalCode && a.postalCode.toLowerCase().includes(term)) ||
          (a.companyID && a.companyID.toLowerCase().includes(term)) ||
          (a.cassNumber && a.cassNumber.toLowerCase().includes(term)) ||
          (a.iataCode && a.iataCode.toLowerCase().includes(term)) ||
          (a.iataAirportCode && a.iataAirportCode.toLowerCase().includes(term)) ||
          (a.airlineCode && a.airlineCode.toLowerCase().includes(term)) 
        );
      });
      
      const totalPages = Math.ceil(filteredAirlines.length / itemsPerPage);
      const displayedAirlines = filteredAirlines.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
      // Afficher les détails dans une pop-up
      const showDetailsModal = (airline) => {
        setSelectedAirline(airline);
        setShowDetails(true);
      };
    
      // Fermer la pop-up des détails
      const closeDetailsModal = () => {
        setShowDetails(false);
        setSelectedAirline(null);
      };
    
      // Afficher la pop-up de modification
      const showEditModal = (airline) => {
        setSelectedAirline(airline);
        setFormData({ ...airline }); // Remplir les champs du formulaire avec les données de la compagnie
        setShowEdit(true);
      };
    
      const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch(`/api/Airline/${selectedAirline._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData), // Nouvelles données à mettre à jour
          });
    
          const data = await response.json();
          if (response.ok) {
            setAirlines((prevState) =>
              prevState.map((a) =>
                a._id === selectedAirline._id ? { ...a, ...formData } : a
              )
            );
            closeDetailsModal();
            alert("Compagnie aérienne modifiée avec succès !");
          } else {
            alert(data.message || "Erreur lors de la modification");
          }
        } catch (error) {
          console.error("Erreur serveur", error);
          alert("Erreur serveur");
        }
      };
    
      // Fermer la pop-up de modification
      const closeEditModal = () => {
        setShowEdit(false);
        setSelectedAirline(null);
      };
    
      // Handle select/deselect all checkboxes
      const handleSelectAll = (e) => {
        if (e.target.checked) {
          setSelectedAirlineIds(displayedAirlines.map((a) => a._id));
        } else {
          setSelectedAirlineIds([]);
        }
      };
    
      const toggleSelection = (id) => {
        setSelectedAirlineIds((prevState) =>
          prevState.includes(id)
            ? prevState.filter((itemId) => itemId !== id)
            : [...prevState, id]
        );
      };
    
      const exportFields = (a) => ({
        "Créé le": new Date(a.createdAt).toLocaleDateString() || "",
        Nom: a.lastname || "",
        Prénom: a.firstname || "",
        Email: a.email || "",
        Téléphone: a.phone || "",
        Fonction: a.function || "",
        Entreprise: a.company || "",
        Pays: a.country || "",
        Ville: a.city || "",
        Adresse: a.address || "",
        "Code Postal": a.postalCode || "",
        "ID Compagnie": a.companyID || "",
        "Numéro CASS": a.cassNumber || "",
        "IATA Code": a.iataCode || "",
        "Code Compagnie": a.airlineCode || "",
        "IATA Airport Code": a.iataAirportCode || "",
      });
      
    
      // Export JSON
      const exportToJSON = () => {
        const data = (selectedAirlineIds.length > 0
            ? airlines.filter((a) => selectedAirlineIds.includes(a._id))
            : displayedAirlines
          ).map(exportFields);        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "airlines.json";
        link.click();
      };
    
      // Export Excel
      const exportToExcel = () => {
        const data = (selectedAirlineIds.length > 0
            ? airlines.filter((a) => selectedAirlineIds.includes(a._id))
            : displayedAirlines
          ).map(exportFields);
                const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Airlines");
        XLSX.writeFile(wb, "airlines.xlsx");
      };
    
      // Export CSV
      const exportToCSV = () => {
        const data = (selectedAirlineIds.length > 0
            ? airlines.filter((a) => selectedAirlineIds.includes(a._id))
            : displayedAirlines
          ).map(exportFields);        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "airlines.csv";
        link.click();
      };
    
      // Export PDF
      const handleExportPDF = () => {
        const doc = new jsPDF('landscape'); // Paysage pour plus d'espace horizontal
    
        const columns = [
            "Créé le", "Nom", "Prénom", "Email", "Téléphone", "Fonction", "Entreprise",
            "Pays", "Ville", "Adresse", "Code Postal", "ID Compagnie", "IATA Code", "Code Compagnie", "IATA Airport Code"
          ];
          
          const data = (selectedAirlineIds.length > 0
            ? airlines.filter((a) => selectedAirlineIds.includes(a._id))
            : displayedAirlines
          ).map(a => [
            new Date(a.createdAt).toLocaleDateString() || "—",
            a.lastname || "",
            a.firstname || "",
            a.email || "",
            a.phone || "",
            a.function || "",
            a.company || "",
            a.country || "",
            a.city || "",
            a.address || "",
            a.postalCode || "",
            a.companyID || "",
            a.iataCode || "",
            a.airlineCode || "",
            a.iataAirportCode || "",
          ]);
          
    
        doc.setFontSize(14);
        doc.text("Liste des Compagnies Aériennes", 14, 15);
    
        autoTable(doc, {
          startY: 25,
          head: [columns],
          body: data,
          theme: 'grid',
          styles: {
            fontSize: 6.6,
            cellPadding: 2,
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [63, 101, 146],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
          },
          bodyStyles: {
            halign: 'center',
            valign: 'middle',
            textColor: [0, 0, 0],
          },
          margin: {
            left: 5,
            right: 1,
            top: 25,
          },
          tableWidth: 'wrap',
          didDrawPage: (data) => {
            doc.setFontSize(10);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
          },
        });
    
        doc.save("airlines.pdf");
      };



  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-4 md:p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl py-12 px-8 shadow-lg relative overflow-x-auto">
        <div className="absolute top-14 right-8">
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
            window.location.href = "/Administrateur/Profil"; 
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


          {/* Titre et recherche */}
          <div className="flex justify-start items-center mb-8 mt-6">
          <h1 className="text-2xl font-semibold text-[#3F6592]">Liste des Compagnies Aériennes</h1>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-12 mt-20">
            <div className="relative w-full lg:w-auto">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Chercher Compagnie..."
                className="border border-gray-300 rounded-full pl-10 pr-4 py-2 w-full lg:w-72 outline-none focus:ring-2 focus:ring-[#3F6592]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-4">
              <select className="border border-gray-300 rounded-full py-2 px-4" value={itemsPerPage} onChange={(e)=>setItemsPerPage(parseInt(e.target.value))}>
                <option value={5}>5 lignes</option>
                <option value={10}>10 lignes</option>
                <option value={15}>15 lignes</option>
                <option value={20}>20 lignes</option>
              </select>

              <button onClick={exportToJSON} className="border border-gray-300 rounded-full py-2 px-4">
                Exporter en JSON
              </button>
              <button onClick={exportToExcel} className="border border-gray-300 rounded-full py-2 px-4">
                Exporter en Excel
              </button>
              <button onClick={exportToCSV} className="border border-gray-300 rounded-full py-2 px-4">
                Exporter en CSV
              </button>
              <button onClick={handleExportPDF} className="border border-gray-300 rounded-full py-2 px-4">
                Exporter en PDF
              </button>
              <button className="bg-[#0EC953] text-white px-5 py-2 rounded-full font-semibold" onClick={() => (window.location.href = "/Administrateur/Compagnies/Ajout")}>Ajouter</button>

            </div>
          </div>

          {/* Tableau des compagnies aérienne */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="min-w-full">
<thead className="bg-[#3F6592] text-white text-left">
  <tr>
    <th className="p-3 border-b border-gray-300">
<input type="checkbox" onChange={handleSelectAll} checked={displayedAirlines.length === selectedAirlineIds.length}/* Check if all items are selected *//></th>
    <th className="p-3 border-b border-gray-300">Création</th>
    {[ "Nom", "Prénom", "Email", "Téléphone", "Fonction", "Entreprise", "Pays", "IATA Code", "Détails", "Modifier", "Supprimer"].map((head, idx) => (
      <th key={idx} className="p-3 border-b border-gray-300">{head}</th>
    ))}
  </tr>
</thead>

<tbody>
{displayedAirlines.length === 0 ? (
    <tr>
                    <td colSpan="10" className="text-center py-4 text-gray-500">Aucune compagnie aérienne trouvée.</td>
    </tr>
  ) : (
    displayedAirlines.map((a, i) => (
        <tr key={i} className={`${i % 2 ? "bg-gray-100" : "bg-white"} border-b border-gray-300`}>
              <td className="p-2">
          <input
            type="checkbox"
            checked={selectedAirlineIds.includes(a._id)}
            onChange={() => toggleSelection(a._id)}
          />
        </td>
          <td className="p-2">{new Date(a.createdAt).toLocaleDateString()}</td>
          <td className="p-2">{a.lastname}</td>
<td className="p-2">{a.firstname}</td>
<td className="p-2">{a.email}</td>
<td className="p-2">{a.phone}</td>
<td className="p-2">{a.function}</td>
<td className="p-2">{a.company}</td>
<td className="p-2">{a.country}</td>
<td className="p-2">{a.iataCode}</td>
        <td className="p-2 text-center">
          <FaEye className="text-blue-500 cursor-pointer" onClick={() => showDetailsModal(a)} />
        </td>
        <td className="p-2 text-center">
          <FaEdit className="text-yellow-500 cursor-pointer" onClick={() => showEditModal(a)} />
        </td>
        <td className="p-2 text-center">
          <FaTrash className="text-red-500 cursor-pointer" onClick={() => handleDelete(a._id)} />
        </td>
      </tr>
    ))
  )}
</tbody>


            </table>
          </div>
            {/* Pagination */}
          <div className="mt-5 flex justify-center items-center gap-3">
            <button disabled={currentPage===1} onClick={()=>setCurrentPage(currentPage-1)}><FaChevronLeft/></button>
            {[...Array(totalPages)].map((_,i)=>(<button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-1 rounded ${currentPage===i+1?"bg-[#3F6592] text-white":"bg-gray-200"}`}>{i+1}</button>))}
            <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(currentPage+1)}><FaChevronRight/></button>
          </div>
        </div>

      

        {showDetails && selectedAirline && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-2xl w-[90%] md:w-[500px] p-6 overflow-y-auto max-h-[90vh]">
      
      <h2 className="text-xl font-bold mb-5 text-center border-b pb-3 text-[#3F6592]">
        🔍 Détails de la Compagnie Aérienne
      </h2>

      <div className="space-y-3 text-gray-700">
        <p><FaUser className="inline mr-2 text-[#3F6592]"/> <strong>Nom :</strong> {selectedAirline.lastname}</p>
        <p><FaUser className="inline mr-2 text-[#3F6592]"/> <strong>Prénom :</strong> {selectedAirline.firstname}</p>
        <p><FaEnvelope className="inline mr-2 text-[#3F6592]"/> <strong>Email :</strong> {selectedAirline.email}</p>
        <p><FaPhone className="inline mr-2 text-[#3F6592]"/> <strong>Téléphone :</strong> {selectedAirline.phone}</p>
        <p><FaBriefcase className="inline mr-2 text-[#3F6592]"/> <strong>Fonction :</strong> {selectedAirline.function}</p>
        <p><FaBuilding className="inline mr-2 text-[#3F6592]"/> <strong>Entreprise :</strong> {selectedAirline.company}</p>
        <p><FaGlobe className="inline mr-2 text-[#3F6592]"/> <strong>Pays :</strong> {selectedAirline.country}</p>
        <p><FaCity className="inline mr-2 text-[#3F6592]"/> <strong>Ville :</strong> {selectedAirline.city}</p>
        <p><FaHome className="inline mr-2 text-[#3F6592]"/> <strong>Adresse :</strong> {selectedAirline.address}</p>
        <p><FaBarcode className="inline mr-2 text-[#3F6592]"/> <strong>Code Postal :</strong> {selectedAirline.postalCode}</p>
        <p><FaIdBadge className="inline mr-2 text-[#3F6592]"/> <strong>ID Compagnie :</strong> {selectedAirline.companyID}</p>
        <p><FaIdBadge className="inline mr-2 text-[#3F6592]"/> <strong>IATA Code :</strong> {selectedAirline.iataCode}</p>
        <p><FaIdBadge className="inline mr-2 text-[#3F6592]"/> <strong>IATA Airport Code :</strong> {selectedAirline.iataAirportCode}</p>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={closeDetailsModal} className="bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-full shadow-md transition-colors">
          ✖️ Fermer
        </button>
      </div>

    </div>
  </div>
)}


{showEdit && selectedAirline && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-2xl w-[90%] md:w-[500px] p-6 overflow-y-auto max-h-[90vh]">
      
      <h2 className="text-xl font-bold mb-6 text-center border-b pb-3 text-[#3F6592]">
        ✏️ Modifier la Compagnie Aérienne
      </h2>

      <form onSubmit={handleEditSubmit} className="grid grid-cols-1 gap-4">

        {/* prénom et nom */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="firstname" value={formData.firstname || ''} onChange={(e)=>setFormData({...formData, firstname:e.target.value})} placeholder="Prénom" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="lastname" value={formData.lastname || ''} onChange={(e)=>setFormData({...formData, lastname:e.target.value})} placeholder="Nom" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Email & Téléphone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input type="email" name="email" value={formData.email || ''} onChange={(e)=>setFormData({...formData, email:e.target.value})} placeholder="Email" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaPhone className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="phone" value={formData.phone || ''} onChange={(e)=>setFormData({...formData, phone:e.target.value})} placeholder="Téléphone" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Fonction et Entreprise */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaBriefcase className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="function" value={formData.function || ''} onChange={(e)=>setFormData({...formData, function:e.target.value})} placeholder="Fonction" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaBuilding className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="company" value={formData.company || ''} onChange={(e)=>setFormData({...formData, company:e.target.value})} placeholder="Entreprise" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Pays et Ville */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaGlobe className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="country" value={formData.country || ''} onChange={(e)=>setFormData({...formData, country:e.target.value})} placeholder="Pays" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaCity className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="city" value={formData.city || ''} onChange={(e)=>setFormData({...formData, city:e.target.value})} placeholder="Ville" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* Adresse et Code postal */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaHome className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="address" value={formData.address || ''} onChange={(e)=>setFormData({...formData, address:e.target.value})} placeholder="Adresse" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
            <FaBarcode className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="postalCode" value={formData.postalCode || ''} onChange={(e)=>setFormData({...formData, postalCode:e.target.value})} placeholder="Code postal" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
        </div>

        {/* ID compagnie et IATA Airport Code  */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
            <input type="text" name="companyID" value={formData.companyID || ''} onChange={(e)=>setFormData({...formData, companyID:e.target.value})} placeholder="ID Compagnie" className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]" />
          </div>
          <div className="relative">
          <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
  <input
    type="text"
    name="iataAirportCode"
    value={formData.iataAirportCode || ''}
    onChange={(e) => setFormData({ ...formData, iataAirportCode: e.target.value })}
    placeholder="IATA Aéroport Code"
    className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]"
  />
          </div>
        </div>
        {/* Codes IATA et Airline */}
<div className="grid grid-cols-2 gap-3">
  <div className="relative">
    <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
    <input
      type="text"
      name="iataCode"
      value={formData.iataCode || ''}
      onChange={(e) => setFormData({ ...formData, iataCode: e.target.value })}
      placeholder="IATA Code"
      className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]"
    />
  </div>
  <div className="relative">
    <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
    <input
      type="text"
      name="airlineCode"
      value={formData.airlineCode || ''}
      onChange={(e) => setFormData({ ...formData, airlineCode: e.target.value })}
      placeholder="Code Compagnie "
      className="border p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F6592]"
    />
  </div>
</div>

        {/* Boutons */}
        <div className="flex justify-end gap-3 mt-4">
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-2 px-5 rounded-full shadow-md transition-colors">
             Enregistrer
          </button>
          <button type="button" onClick={closeEditModal} className="bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-full shadow-md transition-colors">
            ✖️ Fermer
          </button>
        </div>

      </form>

    </div>
  </div>
)}


      </main>
    </div>
  );
}
