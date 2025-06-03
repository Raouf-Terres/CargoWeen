export default function Recu({ data }) {
  return (
    <div id="recu" className="p-10 w-[800px] bg-white text-black text-sm leading-6">
      {/* Logo + Contact */}
      <div className="flex justify-between items-start mb-6">
        <img src="/logodark.png" alt="CargoWeen Logo" className="h-20" />
        <div className="text-right text-xs">
          <p><strong>CargoWeen.com</strong></p>
          <p>Contact@cargoween.com</p>
          <p>+216 20 20 20 20</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Reçu</h2>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <p><strong>Nom</strong></p>
        <p className="font-semibold uppercase">{data.user?.firstname} / {data.user?.lastname}</p>

        <p><strong>Numéro de vol</strong></p>
        <p className="font-bold">{data.flightNumber}</p>

        <p><strong>Aéroport de départ</strong></p>
        <p className="font-bold uppercase">{data.from}</p>

        <p><strong>Aéroport d'arrivée</strong></p>
        <p className="font-bold uppercase">{data.to}</p>

        <p><strong>Méthode de Paiement</strong></p>
        <p className="font-bold uppercase"> En ligne</p>

        <p><strong>Tarif fret/Kg</strong></p>
        <p>{data.tarif} EUR</p>

        <p><strong>Frais LTA</strong></p>
        <p>50 EUR</p>
         <p><strong>Frais Scanner</strong></p>
        <p>30 EUR</p>

        <p><strong>Autres frais</strong></p>
        <p>50 EUR</p>


        <p><strong>Nom compagnie aérienne</strong></p>
        <p>{data.airline}</p>

        <p><strong>Entreprise de transitaire</strong></p>
        <p>{data.user?.company}</p>

        <p><strong>Numéro LTA</strong></p>
        <p>{data.awb}</p>

        <p><strong>Restrictions</strong></p>
        <p>MODIFICATION ET REMBOURSEMENT AVEC FRAIS AVANT LE VOL</p>
 <p><strong>Total</strong></p>
        <p className="font-bold text-lg">{data.totalPrice+ 50 + 30 + 20} EUR</p>
      </div>

      <div className="mt-6 border-t pt-2 text-xs text-gray-600">
        Ce document est généré automatiquement par CargoWeen.
      </div>
    </div>
  );
}
