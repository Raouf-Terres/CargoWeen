export default function AboutSection() {
  return (
    <section  id="About" className="relative bg-[#121B2D] w-full py-20">
      {/* Conteneur principal */}
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-10 space-y-10 lg:space-y-0  h-[550px]">
        {/* Texte de présentation */}
        <div className="text-left max-w-[800px]">
          <h2 className="text-white text-[48px] font-medium leading-tight mb-6">
            À Propos de Nous
          </h2>
          <p className="text-white text-[20px] leading-8">
            Nous sommes une startup Tunisienne labellisée par Startup Act depuis
            octobre 2022 localisée à Nabeul en Tunisie. Nous sommes spécialisés
            dans la digitalisation du fret aérien. Nos solutions s’adressent aux
            transitaires, commissionnaire en douane et compagnies aériennes à
            travers le monde pour les aider dans la gestion du processus de
            réservation du fret aérien.
          </p>
        </div>

        {/* Image */}
        <div className="relative w-[643px] h-[232px]">
          <img
            src="/plane-image.png" // Remplacez par le chemin correct de l'image
            alt="Avion"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
