import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request) {
  let client;
  
  try {
    const url = new URL(request.url);
    const payment_ref = url.pathname.split('/').pop();
    
    if (!payment_ref) {
      return new Response(JSON.stringify({ 
        message: "Référence de paiement manquante" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const uri = 'mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/';
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db("test");
    const collection = db.collection("ReservationsAgent");

    const reservation = await collection.findOne(
      { paymentRef: payment_ref }
    );

    if (!reservation) {
      return new Response(JSON.stringify({ 
        message: "Réservation introuvable" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Formatage des données pour le frontend
    const responseData = {
      _id: reservation._id.toString(),
      userName: reservation.user?.name || reservation.userName || 'Non spécifié',
      userEmail: reservation.user?.email || reservation.userEmail || 'Non spécifié',
      userPhone: reservation.user?.phone || reservation.userPhone || 'Non spécifié',
      userId: reservation.user?.id || reservation.userId || 'Non spécifié',
      paymentStatus: reservation.paymentStatus || 'Non spécifié',
      paymentRef: reservation.paymentRef || 'Non spécifié',
      distanceLivraison: reservation.distanceLivraison || 0,
      prixKm: reservation.prixKm || 0,
      prixArrivee: reservation.prixArrivee || 0,
      douane: reservation.douane || 0,
      tarifTotal: reservation.tarifTotal || 0,
      companyName: reservation.companyName || 'Non spécifié',
      companyId: reservation.companyId || 'Non spécifié',
      deliveryAddress: reservation.deliveryAddress || 'Non spécifié',
      files: reservation.files || {},
      createdAt: reservation.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: reservation.updatedAt?.toISOString() || new Date().toISOString()
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Erreur GET:", err);
    return new Response(JSON.stringify({ 
      message: "Erreur serveur",
      details: err.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (client) await client.close();
  }
}