"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section id="top" className="relative bg-[#121B2D] min-h-screen flex flex-col justify-center items-center px-4 lg:px-16 overflow-hidden">

      {/* Rectangle en haut */}
      <div className="absolute top-0 left-0 w-full h-[107px] bg-[#121B2D]" />

      {/* Ellipse floue */}
      <motion.div
        className="absolute w-[266px] h-[266px] -left-[133px] top-[60%] bg-[#00D5FF] blur-[200px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
      />

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between w-full gap-10 lg:gap-0">
        
        {/* Texte à gauche */}
        <motion.div
          className="text-left max-w-xl space-y-6 lg:ml-20"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.6 }}
        >
          <h1 className="text-white font-roboto text-3xl sm:text-4xl md:text-5xl leading-tight">
            Simplifiez votre fret aérien
          </h1>
          <p className="text-white font-roboto text-base sm:text-lg md:text-xl leading-7">
            Cargoween.com est une plateforme digitale fiable qui vous permet de
            réserver instantanément vos opérations de transport aérien.
          </p>
          <motion.button
            onClick={() => (window.location.href = "/identifier")}
            className="px-6 sm:px-8 py-2 sm:py-3 text-white border-4 border-[#0089B6] rounded-full text-base sm:text-lg font-medium hover:bg-[#0089B6] transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Commencer
          </motion.button>
        </motion.div>

        {/* Carte à droite */}
        <motion.div
          className="w-full max-w-md h-[200px] sm:h-[264px] bg-[#121B2D] lg:mr-20"
          style={{
            backgroundImage: "url('/map.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        />
      </div>

      {/* Bande avec logos */}
      <div className="absolute w-full h-[75px] bottom-0 bg-[#D2E5FF] opacity-80 overflow-hidden">
        <motion.div
          className="flex items-center animate-scroll"
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "linear",
          }}
        >
          <img
            src="/partenaires.png"
            alt="Bande de logos"
            className="h-full object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
