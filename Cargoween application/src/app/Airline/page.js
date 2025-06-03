"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  FaCog, FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt,
  FaBriefcase, FaBuilding, FaIdBadge, FaLock, FaGlobe,
  FaCity, FaHome, FaBarcode
} from "react-icons/fa";

export default function AddTransitaire() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "", lastname: "", email: "", company: "", country: "",
    city: "", address: "", postalCode: "", companyID: "", function: "",
    phone: "", cassNumber: "", password: "", confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

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
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (formData.password !== formData.confirmPassword) return setMessage("❌ Les mots de passe ne correspondent pas !");
    const payload = {
      ...formData,
      isSecondary: true,
      primaryTransitaireEmail: user?.email
    };
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Transitaire ajouté avec succès !");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setMessage(data.message || "❌ Erreur lors de l'ajout");
      }
    } catch {
      setMessage("❌ Erreur serveur");
    }
  };

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-32 shadow-lg relative">
          {/* User display */}
          <button className="absolute top-5 right-7 flex items-center bg-[#3F6592] text-white py-2 px-6 rounded-full shadow-md">
            <FaUser className="mr-2" />
            <span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
          </button>

          <h2 className="text-2xl font-semibold text-[#3F6592] mb-10 text-center">
Tableau de bord  de compagnie aérienne        </h2>

          {message && <p className="text-center text-red-500 mb-4">{message}</p>}

          {/* Image du dashboard */}
<div className="flex justify-center mb-30">
  <img src="/dash.jpg" alt="Dashboard" className="rounded-xl shadow-md w-full max-w-6xl" />
</div>
        </div>
      </main>
    </div>
  );
}

