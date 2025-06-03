"use client";

import { useState } from "react";

import { FaPlane,FaUser, FaBuilding, FaMapMarkerAlt, FaPhone, FaLock, FaGlobe ,FaEnvelope, FaEnvelopeOpen} from "react-icons/fa";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    company: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
    companyID: "",
    function: "",
    phone: "",
    cassNumber: "",
    password: "",
    confirmPassword: "", 
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");



    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Inscription réussie ! ");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMessage(data.message || " Erreur lors de l'inscription");
      }
    } catch (error) {
      setMessage(" Erreur serveur");
    }
  };

  return (
    <>

      {/* Section avec l'image de fond */}
      <section className="relative min-h-screen bg-[#F8F8F8] flex flex-col justify-center items-center" >
              <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/world-map.png')" }}></div>


              <div className="relative bg-[#121B2D] text-white p-12 rounded-xl shadow-lg  mt-8 lg:w-[716px]">
          <h2 className="text-center text-3xl font-semibold mb-6">Transitaire</h2>

          {message && <p className={`text-center ${message.includes("✅") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Champs de formulaire avec icônes */}
            {[
              { name: "firstname", placeholder: "Prénom", icon: <FaUser /> },
              { name: "lastname", placeholder: "Nom", icon: <FaUser /> },
              { name: "email", placeholder: "Email", icon: <FaEnvelope /> },
              { name: "company", placeholder: "Nom de la compagnie", icon: <FaBuilding /> },
              { name: "country", placeholder: "Pays", icon: <FaGlobe /> },
              { name: "city", placeholder: "Ville", icon: <FaMapMarkerAlt /> },
              { name: "address", placeholder: "Adresse", icon: <FaMapMarkerAlt /> },
              { name: "postalCode", placeholder: "Code Postal", icon: <FaLock /> },
              { name: "companyID", placeholder: "ID de votre compagnie", icon: <FaLock /> },
              { name: "function", placeholder: "Fonction", icon: <FaBuilding /> },
              { name: "cassNumber", placeholder: "IATA CASS Num", icon: <FaPlane /> },
            ].map((field, index) => (
              <div key={index} className="relative w-full">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{field.icon}</span>
                <input
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-3 rounded-full bg-gray-200 text-black w-full outline-none focus:ring-2 focus:ring-[#0089B6]"
                  required
                />
              </div>
            ))}

            {/* Numéro de téléphone */}
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FaPhone/></span>
              <input
                type="text"
                name="phone"
                placeholder="Numéro de téléphone"
                onChange={handleChange}
                className="pl-10 pr-4 py-3 rounded-full bg-gray-200 text-black w-full outline-none focus:ring-2 focus:ring-[#0089B6]"
                required
              />
            </div>

            {/* Champ Mot de Passe */}
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock />
              </span>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                onChange={handleChange}
                className="pl-10 pr-4 py-3 rounded-full bg-gray-200 text-black w-full outline-none focus:ring-2 focus:ring-[#0089B6]"
                required
              />
            </div>

            {/*  Champ Confirmation Mot de Passe */}
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock />
              </span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer le mot de passe"
                onChange={handleChange}
                className="pl-10 pr-4 py-3 rounded-full bg-gray-200 text-black w-full outline-none focus:ring-2 focus:ring-[#0089B6]"
                required
              />
            </div>
{/* Bouton d'inscription */}
<div className="col-span-2 flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 text-white border-4 border-[#0089B6] rounded-full text-lg font-medium hover:bg-[#0089B6] transition-all duration-300"
                >
                Je m'inscris
              </button>
              </div>
            </form>
  
            <p className="text-center mt-4">
              Vous avez déjà un compte ?{" "}
              <a href="/login" className="text-[#0089B6] underline">
                Se connecter
              </a>
            </p>
        </div>
      </section>

    </>
  );
}
