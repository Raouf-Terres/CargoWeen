import { MongoClient } from 'mongodb';

export async function GET(request) {
  const uri = "mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("ReservationsAgent");

    // Récupérer l'ID utilisateur depuis les query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'userId est requis'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Récupérer les réservations pour cet utilisateur
    const reservations = await collection.find({ userId }).sort({ reservationDate: -1 }).toArray();

    return new Response(JSON.stringify({
      success: true,
      reservations
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}