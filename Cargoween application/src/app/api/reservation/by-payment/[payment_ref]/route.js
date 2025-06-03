import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Marchandise from "@/models/Marchandise";


export async function GET(req, context) {
  await connectToDatabase();

const url = new URL(req.url);
const paymentRef = url.pathname.split("/").pop(); // récupère la dernière partie de l'URL

  try {
    const reservation = await Reservation.findOne({ paymentRef })
      .populate("user")
      .populate("marchandise");

    if (!reservation) {
      return new Response(JSON.stringify({ message: "Réservation introuvable" }), { status: 404 });
    }

    return new Response(JSON.stringify(reservation), { status: 200 });
  } catch (err) {
    console.error("Erreur GET reservation by paymentRef:", err);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
