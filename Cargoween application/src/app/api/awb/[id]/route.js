import { connectToDatabase } from "@/lib/mongodb";
import AWBStock from "@/models/Stockawb";
import mongoose from "mongoose";

export async function DELETE(request, context) {
    await connectToDatabase();

 const { id } = context.params;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ message: "ID invalide." }), { status: 400 });
  }

  const deleted = await AWBStock.findByIdAndDelete(id);
  if (!deleted) {
    return new Response(JSON.stringify({ message: "LTA introuvable." }), { status: 404 });
  }

  return new Response(JSON.stringify({ message: "LTA supprimé avec succès." }), { status: 200 });
}
