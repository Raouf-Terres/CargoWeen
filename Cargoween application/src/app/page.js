"use client";
import Header from '../components/Header';
import Footer from '../components/Footer';
import AboutSection from '../components/AboutSection';
import TransitairesSection from '../components/TransitairesSection';
import Navbar from '../components/Navbar';
import CompagniesAériennes from '@/components/CompagniesAériennes';
import Temoignages from '@/components/Temoignages';
import ChatBot from '@/components/ChatBot'; 
import { useEffect } from "react";


export default function Home() {


  useEffect(() => {
    // Appel à l'API d'initialisation de l'administrateur
    const initializeAdmin = async () => {
      try {
        const response = await fetch("/api/auth/admin-initialisation");
        const data = await response.json();
        console.log(data.message);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'administrateur :", error);
      }
    };

    initializeAdmin();  // Effectuer l'appel pour créer un administrateur
  }, []);
  return (
    <>
          <Navbar />

      <Header />
      <AboutSection />
      <TransitairesSection />
      <CompagniesAériennes/>
      <Temoignages/>

      <Footer />
      {/* ChatBot en bas à droite */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}>
        <ChatBot />
      </div>
    </>
  );
}
