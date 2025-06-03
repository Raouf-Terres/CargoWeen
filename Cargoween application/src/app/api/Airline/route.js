import { connectToDatabase } from "@/lib/mongodb";
import Airline from "@/models/Airline";

// Récupérer toutes les compagnies aériennes
export async function GET() {
  try {
    await connectToDatabase();
    const airlines = await Airline.find().select("-password -verificationCode -verificationCodeExpires");
    return new Response(JSON.stringify(airlines), { status: 200 });
  } catch (error) {
    console.error("Erreur chargement des compagnies aériennes:", error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
