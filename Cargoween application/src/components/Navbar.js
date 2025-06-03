"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // Icônes menu

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClasses = (base = "") =>
    `text-base font-medium transition-all duration-300 ${base} ${
      isScrolled ? "text-[#121B2D]" : "text-white"
    } hover:underline`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-[80px] lg:h-[120px] flex items-center justify-between px-6 lg:px-8 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-[#121B2D]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center z-50">
        <a href="#top">
          <img
            src={isScrolled ? "/logodark.png" : "/logo.png"}
            alt="Logo"
            className="w-[80px] lg:w-[102px] h-auto"
          />
        </a>
      </div>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center justify-center space-x-8">
        {[
          ["#About", "A propos"],
          ["#Transitaires", "Transitaires"],
          ["#compagnies", "Compagnies aériennes"],
          ["#actualites", "Actualités"],
          ["#Durabilite", "Durabilité"],
          ["#contact", "Contacter-nous"],
        ].map(([href, label]) => (
          <a key={href} href={href} className={linkClasses()}>
            {label}
          </a>
        ))}
      </div>

      {/* Buttons (Desktop only) */}
      <div className="hidden lg:flex items-center space-x-4">
        <button
          onClick={() => (window.location.href = "/login")}
          className={`w-[160px] h-[44px] border-[2.5px] rounded-full font-medium transition-all ${
            isScrolled
              ? "border-[#0089B6] text-[#121B2D] hover:bg-[#0089B6] hover:text-white"
              : "border-[#0089B6] text-white hover:bg-[#0089B6] hover:text-white"
          }`}
        >
          Connexion
        </button>
        <button
          className={`w-[60px] h-[44px] border-[2.5px] rounded-full font-medium transition-all ${
            isScrolled
              ? "border-[#0089B6] text-[#121B2D] hover:bg-[#0089B6] hover:text-white"
              : "border-[#0089B6] text-white hover:bg-[#0089B6] hover:text-white"
          }`}
        >
          EN
        </button>
      </div>

      {/* Mobile Menu Icon */}
      <div className="lg:hidden z-50">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <X size={32} color={isScrolled ? "#121B2D" : "white"} />
          ) : (
            <Menu size={32} color={isScrolled ? "#121B2D" : "white"} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className={`fixed top-[80px] left-0 w-full bg-white shadow-lg z-40 flex flex-col items-center space-y-6 py-6 transition-all`}
        >
          {[
            ["#About", "A propos"],
            ["#Transitaires", "Transitaires"],
            ["#compagnies", "Compagnies aériennes"],
            ["#actualites", "Actualités"],
            ["#Durabilite", "Durabilité"],
            ["#contact", "Contacter-nous"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-[#121B2D] font-medium text-lg hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}

          <button
            onClick={() => (window.location.href = "/login")}
            className="w-[80%] py-3 border-2 border-[#0089B6] text-[#121B2D] rounded-full font-medium hover:bg-[#0089B6] hover:text-white"
          >
            Connexion
          </button>
          <button className="w-[80px] h-[40px] border-2 border-[#0089B6] text-[#121B2D] rounded-full font-medium hover:bg-[#0089B6] hover:text-white">
            EN
          </button>
        </div>
      )}
    </nav>
  );
}
