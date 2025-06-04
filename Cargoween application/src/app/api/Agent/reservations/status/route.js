import { MongoClient, ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

// Configuration corrigée pour Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mariembenhassine30@gmail.com',
    pass: 'fuie ginb atmb uotb' // Mot de passe d'application
  }
});

export async function PUT(request) {
  const uri = "mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/";
  let client;

  try {
    const { reservationId, status } = await request.json();

    if (!reservationId || !status) {
      return new Response(JSON.stringify({
        success: false,
        message: 'reservationId et status sont requis'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db("test");
    const collection = db.collection("ReservationsAgent");
    
    const reservation = await collection.findOne({ _id: new ObjectId(reservationId) });
    
    if (!reservation) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Réservation non trouvée'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(reservationId) },
      { $set: { status } }
    );

    if (status === 'livré' && result.modifiedCount === 1) {
      try {
        const mailOptions = {
          from: '"CargoWeen" <mariembenhassine30@gmail.com>', // Utilisez votre email Gmail
          to: reservation.userEmail,
          subject: `Votre réservation #${reservationId} a été livrée`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #3F6592;">Confirmation de livraison</h2>
              <p>Bonjour ${reservation.userName},</p>
              <p>Nous vous informons que votre réservation <strong>#${reservationId}</strong> a été livrée avec succès.</p>
              <p>Détails de la réservation :</p>
              <ul>
                <li>Numéro de réservation: ${reservationId}</li>
                <li>Date de réservation: ${new Date(reservation.reservationDate).toLocaleDateString('fr-FR')}</li>
                <li>Adresse de livraison: ${reservation.deliveryAddress}</li>
              </ul>
              <p>Merci pour votre confiance.</p>
              <p>Cordialement,<br>L'équipe de ${reservation.companyName}</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777;">
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log("Email de notification envoyé avec succès");
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
      }
    }

    return new Response(JSON.stringify({ 
      success: result.modifiedCount === 1,
      message: result.modifiedCount === 1 ? "Statut mis à jour" : "Aucune modification"
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

