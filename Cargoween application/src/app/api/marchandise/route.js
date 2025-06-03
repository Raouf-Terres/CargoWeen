import Marchandise from "@/models/Marchandise";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const marchandise = await Marchandise.create(body);
    return new Response(JSON.stringify(marchandise), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
