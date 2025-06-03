import { connectToDatabase } from "@/lib/mongodb";
import Transitaire from "@/models/Transitaire";

// Suppression d'un transitaire
export async function DELETE(req) {
  try {
    // Extraire l'id directement des params dans une route dynamique
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Récupérer l'ID depuis l'URL dynamique

    if (!id) {
      return new Response(
        JSON.stringify({ message: "ID du transitaire manquant" }),
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Supprimer le transitaire par ID
    const deletedTransitaire = await Transitaire.findByIdAndDelete(id);

    if (!deletedTransitaire) {
      return new Response(
        JSON.stringify({ message: "Transitaire non trouvé" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Transitaire supprimé avec succès" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: error.message }),
      { status: 500 }
    );
  }
}


// Mise à jour du transitaire (PUT)
export async function PUT(req) {
  try {
    const { pathname } = req.nextUrl;
    const id = pathname.split("/").pop();

    if (!id) {
      return new Response(
        JSON.stringify({ message: "ID du transitaire manquant" }),
        { status: 400 }
      );
    }

    const updatedData = await req.json(); // Les nouvelles données du transitaire
    await connectToDatabase();

    const updatedTransitaire = await Transitaire.findByIdAndUpdate(id, updatedData, {
      new: true, // Retourne le transitaire mis à jour
    });

    if (!updatedTransitaire) {
      return new Response(
        JSON.stringify({ message: "Transitaire non trouvé" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Transitaire mis à jour avec succès", transitaire: updatedTransitaire }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du transitaire:", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: error.message }),
      { status: 500 }
    );
  }
}
