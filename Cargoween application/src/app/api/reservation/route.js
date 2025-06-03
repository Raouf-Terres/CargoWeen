import Reservation from "@/models/Reservation";
import Marchandise from "@/models/Marchandise"; 

import { connectToDatabase } from "@/lib/mongodb";


export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const reservation = await Reservation.create(body);
    return new Response(JSON.stringify(reservation), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
export const GET = async (req) => {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ message: "userId manquant" }), { status: 400 });
  }

  try {
    const reservations = await Reservation.find({ user: userId }).populate("marchandise");
    return new Response(JSON.stringify(reservations), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
};
