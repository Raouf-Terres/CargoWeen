import { connectToDatabase } from "@/lib/mongodb";
import AWBStock from "@/models/Stockawb";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDatabase();
  const awbs = await AWBStock.find();
  return new Response(JSON.stringify(awbs), { status: 200 });
}

export async function POST(req) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const awb = await AWBStock.create(body);
    return new Response(JSON.stringify(awb), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
export async function DELETE(request, { params }) {
  await connectToDatabase();
  const { id } = params;

  try {
    const deleted = await AWBStock.findByIdAndDelete(id);
    if (!deleted) {
      return new Response(JSON.stringify({ message: "AWB non trouvé." }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: "AWB supprimé avec succès." }), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur." }), { status: 500 });
  }
}

