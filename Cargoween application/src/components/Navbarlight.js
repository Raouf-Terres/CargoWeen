"use client";

import { useState, useEffect } from "react";

export default function Navbarlight () {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-[110px] flex items-center justify-between px-12 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white"
      }`}
    >
      {/* Logo */}
      <div className="absolute left-12 top-[5px] w-[120px] transition-all duration-300">
        <img src="/logodark.png" alt="Logo" className="w-full h-auto" />
      </div>

      {/* Navigation Links */}
      <div className="flex justify-center items-center space-x-8 absolute left-[300px] top-[35px]">
        {[
          "A propos",
          "Transitaires",
          "Compagnies aériennes",
          "Cargo Avion",
          "Actualités",
          "Durabilité",
          "Contacter nous",
        ].map((item) => (
          <a
            key={item}
            href={`#${item.replace(/\s+/g, "").toLowerCase()}`}
            className={`text-lg font-medium transition-all duration-300 text-[#121B2D] hover:text-[#0089B6]`}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Boutons */}
      <div className="absolute right-12 flex space-x-4 items-center">
        {/* Connexion Button */}
        <button className="w-[160px] h-[48px] border-[2px] border-[#0089B6] text-[#121B2D] rounded-full font-medium hover:bg-[#0089B6] hover:text-white transition-all duration-300">
          Connexion
        </button>

        {/* Langue */}
        <button className="w-[60px] h-[48px] border-[2px] border-[#0089B6] text-[#121B2D] rounded-full font-medium hover:bg-[#0089B6] hover:text-white transition-all duration-300">
          EN
        </button>
      </div>
    </nav>
  );
}
