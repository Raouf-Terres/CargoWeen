export default function TransitairesSection() {
  return (
    
    <section id="Transitaires" className="relative bg-[#121B2D] py-20 overflow-hidde">
      {/* Fond flou */}
      <div
          className="absolute w-[1601px] h-[305px] -left-[133px] top-[304px] bg-[#304F6E] blur-[150px]"
          ></div>

      {/* Titre principal */}
      <div className="text-center mb-2">
        <h2 className="text-white text-[100px] font-roboto">Solution Transitaires</h2>
      </div>

      {/* Image principale des étapes */}
      <div className="relative flex justify-center mb-16">
        <img
          src="/solution.png"
          alt="Solution Transitaires"
          className="w-[1354px] h-[438px] object-contain"
        />
      </div>

      {/* Étapes principales */}
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center space-y-10 lg:space-y-0">
        {/* Rechercher */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-white text-[54px] font-medium">Rechercher</h3>
        </div>

        {/* Comparer */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-white text-[54px] font-medium">Comparer</h3>
        </div>

        {/* Réserver */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-white text-[54px] font-medium">Réserver</h3>
        </div>
      </div>

      <div className="container mx-auto mt-48 space-y-16">
      {/* Rechercher des devis */}
      <div className="flex flex-col lg:flex-row items-center lg:space-x-10 space-y-10 lg:space-y-0">
        <div className="lg:w-1/2">
          <h4 className="text-white text-[40px] font-roboto mb-4">
            Rechercher des devis en deux clics
          </h4>
          <p className="text-white text-[26px] font-roboto leading-8">
            Grâce aux partenariats avec plusieurs compagnies aériennes, vous
            n’avez plus besoin d’envoyer des demandes de devis pour avoir les
            prix correspondant à vos critères. En quelques minutes, vous
            pouvez accéder à toutes les offres et capacités disponibles pour
            votre marchandise. Il faut juste vous inscrire et remplir les
            champs qui correspondent au vol que vous recherchez.
          </p>
        </div>
        <div className="lg:w-1/2">
          <img
            src="/recherche.png"
            alt="Devis"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Comparer les offres */}
      <div className="flex flex-col lg:flex-row-reverse items-center lg:space-x-reverse lg:space-x-10 space-y-10 lg:space-y-0">
        <div className="lg:w-1/2">
          <h4 className="text-white text-[40px] font-roboto mb-4">
            Comparer les offres
          </h4>
          <p className="text-white text-[26px] font-roboto leading-8">
            Les offres qui correspondent à vos critères de recherche seront
            listées clairement et vous pouvez les organiser facilement selon
            vos préférences (prix, durée…). Les tarifs sont les mêmes que
            ceux des compagnies aériennes et sont disponibles en temps réel.
          </p>
        </div>
        <div className="lg:w-1/2">
          <img
            src="/compare.png"
            alt="Comparer"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Réserver */}
      <div className="flex flex-col lg:flex-row items-center lg:space-x-10 space-y-10 lg:space-y-0">
        <div className="lg:w-1/2">
          <h4 className="text-white text-[40px] font-roboto mb-4">
            Réserver et recevoir la confirmation instantanément
          </h4>
          <p className="text-white text-[26px] font-roboto leading-8">
            Une fois que vous avez fait votre choix, il faut juste saisir
            votre identifiant. Un document sera automatiquement généré pour
            valider votre réservation. Tous vos documents sont centralisés
            dans votre tableau de bord.
          </p>
        </div>
        <div className="lg:w-1/2">
          <img
            src="/reserve.png"
            alt="Réserver"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
      </div>
    </section>
  );
}
