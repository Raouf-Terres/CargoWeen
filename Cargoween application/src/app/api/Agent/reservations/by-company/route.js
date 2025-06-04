//app/api/reservations/by-company/route.js
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request) {
    const uri = "mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/";
    let client;

    try {
        const { searchParams } = new URL(request.url);
        const
            companyId = searchParams.get('companyId');

        if (!companyId) {
            return new Response(JSON.stringify({
                success: false,
                message: 'companyId est requis'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        client = new MongoClient(uri);
        await client.connect();

        const db = client.db("test");

        // 1. Récupère les réservations où le transitaire est le destinataire
        const reservations = await db.collection("ReservationsAgent")
            .find({

                companyId: companyId
            })
            .toArray();

        // 2. Récupère les infos des transitaires expéditeurs
        const senderIds = reservations.map(r => new ObjectId(r.userId));
        const transitaires = await db.collection("transitaires")
            .find({
                _id: { $in: senderIds }
            })
            .toArray();

        // 3. Combine les données
        const result = reservations.map(reservation => {
            const sender = transitaires.find(t => t._id.toString() === reservation.userId);
            return {
                ...reservation,
                senderTransitaire: sender || null
            };
        });

        return new Response(JSON.stringify({
            success: true,
            data: result
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