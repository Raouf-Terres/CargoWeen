"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  FaUser, FaEnvelope, FaPhone, FaBriefcase, FaBuilding,
  FaGlobe, FaCity, FaHome, FaBarcode, FaIdBadge, FaLock,
  FaMoneyBillWave, FaFax, FaGlobeAmericas, FaUserTie
} from "react-icons/fa";

export default function ProfilTransitaire() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstname: "", lastname: "", email: "", phone: "",
    company: "", country: "", city: "", address: "",
    postalCode: "", companyID: "", function: "", cassNumber: "",
    prixKm: "", prixArrivee: "", douane: "",
    fax: "", website: "", responsiblePerson: "",
    password: "", confirmPassword: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setFormData((prev) => ({
          ...prev,
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
          phone: data.phone || "",
          company: data.company || "",
          country: data.country || "",
          city: data.city || "",
          address: data.address || "",
          postalCode: data.postalCode || "",
          companyID: data.companyID || "",
          function: data.function || "",
          cassNumber: data.cassNumber || "",
          prixKm: data.prixKm || "",
          prixArrivee: data.prixArrivee || "",
          douane: data.douane || "",
          fax: data.fax || "",
          website: data.website || "",
          responsiblePerson: data.responsiblePerson || "",
          password: "",
          confirmPassword: ""
        }));
      }
    };

    fetchUser();

    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-menu")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage("❌ Les mots de passe ne correspondent pas !");
    }

    const payload = {
      transitaireId: user._id,
      ...formData,
    };

    const res = await fetch("/api/transitaires/profil-update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Profil mis à jour !");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } else {
      setMessage(data.message || "Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-20 shadow-lg relative">
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
                    onClick={() => router.push("/Transitaire/Profil")}
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

          <h2 className="text-2xl font-semibold text-[#3F6592] mb-10 text-center">Modifier Votre Profil</h2>
          {message && <p className="text-center text-red-500 mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField icon={<FaUser />} name="firstname" placeholder="Prénom" value={formData.firstname} handleChange={handleChange} />
            <InputField icon={<FaUser />} name="lastname" placeholder="Nom" value={formData.lastname} handleChange={handleChange} />
            <InputField icon={<FaEnvelope />} name="email" placeholder="Email" value={formData.email} handleChange={handleChange} />
            <InputField icon={<FaPhone />} name="phone" placeholder="Téléphone" value={formData.phone} handleChange={handleChange} />
            <InputField icon={<FaBriefcase />} name="function" placeholder="Fonction" value={formData.function} handleChange={handleChange} />
            <InputField icon={<FaBuilding />} name="company" placeholder="Entreprise" value={formData.company} handleChange={handleChange} />
            <InputField icon={<FaGlobe />} name="country" placeholder="Pays" value={formData.country} handleChange={handleChange} />
            <InputField icon={<FaCity />} name="city" placeholder="Ville" value={formData.city} handleChange={handleChange} />
            <InputField icon={<FaHome />} name="address" placeholder="Adresse" value={formData.address} handleChange={handleChange} />
            <InputField icon={<FaBarcode />} name="postalCode" placeholder="Code Postal" value={formData.postalCode} handleChange={handleChange} />
            <InputField icon={<FaIdBadge />} name="companyID" placeholder="ID Compagnie" value={formData.companyID} handleChange={handleChange} />
            <InputField icon={<FaIdBadge />} name="cassNumber" placeholder="Numéro CASS" value={formData.cassNumber} handleChange={handleChange} />

            {/* Nouveaux champs */}
            <InputField icon={<FaMoneyBillWave />} name="prixKm" placeholder="Prix par Km" value={formData.prixKm} handleChange={handleChange} />
            <InputField icon={<FaMoneyBillWave />} name="prixArrivee" placeholder="Prix Arrivée" value={formData.prixArrivee} handleChange={handleChange} />
            <InputField icon={<FaMoneyBillWave />} name="douane" placeholder="Douane" value={formData.douane} handleChange={handleChange} />
            <InputField icon={<FaFax />} name="fax" placeholder="Fax" value={formData.fax} handleChange={handleChange} />
            <InputField icon={<FaGlobeAmericas />} name="website" placeholder="Site Web" value={formData.website} handleChange={handleChange} />
            <InputField icon={<FaUserTie />} name="responsiblePerson" placeholder="Personne Responsable" value={formData.responsiblePerson} handleChange={handleChange} />

            <InputField
              icon={<FaLock />}
              type="password"
              name="password"
              placeholder="Nouveau mot de passe"
              value={formData.password}
              handleChange={handleChange}
            />

            <InputField
              icon={<FaLock />}
              type="password"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              handleChange={handleChange}
            />

            <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
              <button type="submit" className="bg-[#0EC953] text-white px-8 py-3 rounded-full font-medium hover:bg-green-600 transition-all">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function InputField({ icon, name, placeholder, handleChange, value = "", type = "text" }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"
      />
    </div>
  );
}
