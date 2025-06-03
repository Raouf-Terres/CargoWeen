import { connectToDatabase } from "@/lib/mongodb";
import Airline from "@/models/Airline";

// Suppression d'une compagnie aérienne
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Récupérer l'ID depuis l'URL dynamique

    if (!id) {
      return new Response(
        JSON.stringify({ message: "ID de la compagnie aérienne manquant" }),
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedAirline = await Airline.findByIdAndDelete(id);

    if (!deletedAirline) {
      return new Response(
        JSON.stringify({ message: "Compagnie aérienne non trouvée" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Compagnie aérienne supprimée avec succès" }),
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

// Mise à jour d'une compagnie aérienne
export async function PUT(req) {
  try {
    const { pathname } = req.nextUrl;
    const id = pathname.split("/").pop();

    if (!id) {
      return new Response(
        JSON.stringify({ message: "ID de la compagnie aérienne manquant" }),
        { status: 400 }
      );
    }

    const updatedData = await req.json(); // Les nouvelles données de la compagnie aérienne
    await connectToDatabase();

    const updatedAirline = await Airline.findByIdAndUpdate(id, updatedData, {
      new: true, // Retourne la compagnie mise à jour
    });

    if (!updatedAirline) {
      return new Response(
        JSON.stringify({ message: "Compagnie aérienne non trouvée" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Compagnie aérienne mise à jour avec succès",
        airline: updatedAirline,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la compagnie aérienne:", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: error.message }),
      { status: 500 }
    );
  }
}
