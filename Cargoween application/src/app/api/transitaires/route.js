import { connectToDatabase } from "@/lib/mongodb";
import Transitaire from "@/models/Transitaire";

export async function GET() {
  try {
    await connectToDatabase();
    const transitaires = await Transitaire.find().select("-password -verificationCode -verificationCodeExpires");
    return new Response(JSON.stringify(transitaires), { status: 200 });
  } catch (error) {
    console.error("Erreur chargement des transitaires:", error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
