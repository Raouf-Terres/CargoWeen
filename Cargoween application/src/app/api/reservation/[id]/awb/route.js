
import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Stockawb from "@/models/Stockawb";

export async function PATCH(request) {
  await connectToDatabase();

  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").slice(-2)[0];

    const body = await request.json();
    const { awb, comment = "" } = body; // récupérer le commentaire saisi

    // Vérifier si le LTA existe et n'est pas déjà utilisé
    const awbRecord = await Stockawb.findOne({ number: awb });

    if (!awbRecord || awbRecord.used) {
      return new Response(
        JSON.stringify({ message: "Ce numéro LTA est déjà utilisé ou n'existe pas." }),
        { status: 400 }
      );
    }

    // Mettre à jour la réservation avec le nouveau commentaire saisi
    const updated = await Reservation.findByIdAndUpdate(
      id,
      {
        awb: awbRecord.number,
        awbType: awbRecord.awbType,
        awbComment: comment, // on écrase avec celui saisi manuellement
      },
      { new: true }
    );

    if (!updated) {
      return new Response(
        JSON.stringify({ message: "Réservation non trouvée." }),
        { status: 404 }
      );
    }

    // Marquer le LTA comme utilisé
    await Stockawb.findByIdAndUpdate(awbRecord._id, { used: true });

    return new Response(JSON.stringify(updated), { status: 200 });

  } catch (error) {
    console.error("Erreur PATCH /reservation/[id]/awb:", error);
    return new Response(JSON.stringify({ message: "Erreur serveur." }), { status: 500 });
  }
};
