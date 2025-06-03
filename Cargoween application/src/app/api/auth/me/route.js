import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Transitaire from "@/models/Transitaire";
import Airline from "@/models/Airline";
import Admin from "@/models/Admin";
import { connectToDatabase } from "@/lib/mongodb";

export const GET = async (req) => {
  try {
    await connectToDatabase();

    // Récupérer le token depuis les headers
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Token manquant" }, { status: 401 });
    }

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ message: "Token invalide" }, { status: 403 });
    }

    const email = decoded.email;

    // Recherche dans Admin, Transitaire puis Airline
    let user =
      (await Admin.findOne({ email })) ||
      (await Transitaire.findOne({ email })) ||
      (await Airline.findOne({ email }));

    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Retourner les infos communes à tous les utilisateurs
    return NextResponse.json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      company: user.company || "",
      country: user.country || "",
      city: user.city || "",
      postalCode: user.postalCode || "",
      companyID: user.companyID || "",
      function: user.function || "",
      cassNumber: user.cassNumber || "",
       prixKm: user.prixKm || "",
  prixArrivee: user.prixArrivee || "" ,
  douane: user.douane || "",
  fax: user.fax || "",
  website: user.website || "",
  responsiblePerson: user.responsiblePerson || "",
    });

  } catch (error) {
    console.error("Erreur API /auth/me :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
