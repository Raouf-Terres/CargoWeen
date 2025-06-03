export default function CompagniesAeriennes() {
    return (
      <section  id="compagnies" className="relative bg-[#121B2D] py-20">


  
        {/* Image principale */}
        <div className="relative flex justify-center mb-32 opacity-85">
          <img
            src="/aircargo.png"
            alt="Avion Cargo"
            className="w-[1355px] h-[457px] object-cover"
          />
        </div>
                {/* Rectangle flou */}

        <div
          className="absolute w-[1601px] h-[305px] -left-[133px] top-[854px] bg-[#304F6E] blur-[150px]"
          ></div>
        {/* Titre principal */}
        <div className="text-center mb-32">
          <h2 className="text-white text-[80px] font-roboto font-medium">
            Solution Compagnies aériennes
          </h2>
        </div>
  {/* Image principale des étapes */}
  <div className="relative flex justify-center mb-12">
        <img
          src="/solutioncompagnies.png"
          alt="Solution Transitaires"
          className="w-[1352px] h-[419px] object-contain"
        />
      </div>
        {/* Groupes de solutions */}
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center space-y-10 lg:space-y-0">
          {/* Gagnez en visibilité */}
          <div className="flex flex-col items-center text-center space-y-4">
            
            <h3 className="text-white text-[40px] font-roboto font-medium">
              Gagnez en visibilité
            </h3>
          </div>
  
          {/* Gagner en compétitivité */}
          <div className="flex flex-col items-center text-center space-y-4">
            
            <h3 className="text-white text-[40px] font-roboto font-medium">
              Gagner en compétitivité
            </h3>
          </div>
  
          {/* Améliorez vos performances */}
          <div className="flex flex-col items-center text-center space-y-4">
            
            <h3 className="text-white text-[40px] font-roboto font-medium">
              Améliorez vos performances
            </h3>
          </div>
        </div>
{/* Group 45 */}
<div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 mt-48">
  {/* Gagnez en visibilité */}
  <div className="flex flex-col items-start text-left space-y-4">
    <h3 className="text-white text-[48px] font-medium leading-[56px]">
      Gagnez en visibilité sur le marché
    </h3>
    <p className="text-white text-[24px] leading-[28px]">
      Avec cargoween.com, vos offres seront consultées par un nombre croissant
      de transitaires internationaux. Grâce à notre processus de vérification
      interne, nous garantissons la confidentialité de vos tarifs. Nous
      traitons aussi les demandes B2C des clients qui ne passent pas par un
      transitaire. Cela grâce à des partenariats solides dans divers pays à
      travers le monde.
    </p>
  </div>
  <div className="flex justify-center">
    <img
      src="/visibilite.png"
      alt="Visibilité"
      className="w-[484px] h-[453px] object-contain"
    />
  </div>

  {/* Gagner en efficacité */}
  <div className="flex justify-center order-last lg:order-none">
    <img
      src="/comptabilite.png"
      alt="Efficacité"
      className="w-[598px] h-[408px] object-contain"
    />
  </div>
  <div className="flex flex-col items-start text-left space-y-4">
    <h3 className="text-white text-[40px] font-medium leading-[47px]">
      Gagner en efficacité et en compétitivité
    </h3>
    <p className="text-white text-[24px] leading-[28px]">
      Le processus actuel vous fait perdre un temps et des coûts considérables
      dans des opérations de réservation manuelles lourdes (appels, e-mails,
      devis). Notre solution vous aidera à augmenter votre efficacité et à
      réduire les coûts et le temps de traitement. Votre équipe commerciale
      pourra se concentrer alors sur des tâches à forte valeur ajoutée. Vous
      bénéficierez aussi automatiquement de tous les accords et partenariats
      que nous mettrons en place à travers le monde.
    </p>
  </div>

  {/* Stratégie commerciale */}
  <div className="flex flex-col items-start text-left space-y-4">
    <h3 className="text-white text-[40px] font-medium leading-[47px]">
      Nous vous aiderons à définir votre stratégie commerciale
    </h3>
    <p className="text-white text-[32px] leading-[38px]">
      Nous vous offrons des outils BI accessibles dans votre espace client
      sécurisé qui vous donneront une visibilité complète sur vos performances
      commerciales en temps réel. Nous pouvons également vous accompagner dans
      le processus de migration d’offres statiques à des offres dynamiques pour
      maximiser vos revenus.
    </p>
  </div>
  <div className="flex justify-center">
    <img
      src="/performance.png"
      alt="Stratégie commerciale"
      className="w-[611px] h-[192px]] object-contain"
    />
  </div>
</div>

      </section>
    );
  }
  