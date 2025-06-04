import { MongoClient, ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic'; // Important pour les webhooks
let client;


// Le webhook de Konnect appelle cette route POST
export const POST = async (req) => {
  try {
    const uri = 'mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/';
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db("test");
    const collection = db.collection("ReservationsAgent");

    const body = await req.json();
    console.log("Webhook Konnect body:", body);

    const { reservationId } = body;

    if (!reservationId) {
      return new Response(JSON.stringify({ message: "reservationId manquant" }), { status: 400 });
    }

    const updated = await collection.findByIdAndUpdate(reservationId, {
      etat: "Acceptée",
      status: "Payée"
    });

    if (!updated) {
      return new Response(JSON.stringify({ message: "Réservation introuvable" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Statut paiement mis à jour avec succès" }), { status: 200 });

  } catch (err) {
    console.error("Erreur webhook Konnect:", err);
    return new Response(JSON.stringify({ message: "Erreur serveur webhook." }), { status: 500 });
  }
};

// Gère les requêtes GET inutiles envoyées par Konnect
export const GET = async () => {
  return new Response(JSON.stringify({ message: "Méthode GET non supportée sur ce webhook" }), {
    status: 405,
  });
};
