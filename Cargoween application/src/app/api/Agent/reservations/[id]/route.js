// app/api/reservations/[id]/route.js
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  const uri = "mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("ReservationsAgent");

    // Await the params object
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'ID de réservation invalide'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reservation = await collection.findOne({ _id: new ObjectId(id) });

    if (!reservation) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Réservation non trouvée'
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      reservation
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