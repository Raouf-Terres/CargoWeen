// app/api/reservations/[id]/route.js
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    const uri = "mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/";
    let client;

    try {
        // Await the params if needed (though usually params is available synchronously)
        const id = params.id;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: 'ID de réservation requis'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        client = new MongoClient(uri);
        await client.connect();

        const db = client.db("test");

        // Récupère la réservation
        const reservation = await db.collection("ReservationsAgent")
            .findOne({ _id: new ObjectId(id) });

        if (!reservation) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Réservation non trouvée'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Récupère les infos du client
        const clientInfo = await db.collection("transitaire")
            .findOne({ _id: new ObjectId(reservation.userId) });

        // Récupère les infos de l'entreprise
        const companyInfo = await db.collection("transitaires")
            .findOne({ _id: new ObjectId(reservation.companyId) });

        return new Response(JSON.stringify({
            success: true,
            data: {
                ...reservation,
                senderTransitaire: clientInfo,
                companyInfo: companyInfo
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Erreur:', error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        if (client) await client.close();
    }
}