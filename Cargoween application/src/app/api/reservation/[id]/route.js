import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
 

export async function GET(req) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  await connectToDatabase();


  try {
    const reservation = await Reservation.findById(id)
      .populate("marchandise")
      .populate("user");

    if (!reservation) {
      return new Response(JSON.stringify({ message: "Réservation non trouvée" }), { status: 404 });
    }

    return new Response(JSON.stringify(reservation), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
