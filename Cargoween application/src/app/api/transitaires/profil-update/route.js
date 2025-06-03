import { connectToDatabase } from "@/lib/mongodb";
import Transitaire from "@/models/Transitaire";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      transitaireId,
      firstname,
      lastname,
      company,
      country,
      city,
      address,
      postalCode,
      companyID,
      function: jobFunction,
      phone,
      cassNumber,
      email,
      password,
      prixKm,
      prixArrivee,
      douane,
      fax,
      website,
      responsiblePerson,
    } = body;

    const updateData = {
      firstname,
      lastname,
      company,
      country,
      city,
      address,
      postalCode,
      companyID,
      function: jobFunction,
      phone,
      cassNumber,
      email,
      prixKm,
      prixArrivee,
      douane,
      fax,
      website,
      responsiblePerson,
    };

    // Supprimer les champs undefined pour éviter d’écraser avec undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Hasher le mot de passe si présent
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    const updated = await Transitaire.findByIdAndUpdate(transitaireId, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ message: "Transitaire non trouvé." }, { status: 404 });
    }

    return NextResponse.json({ message: "Profil mis à jour avec succès", transitaire: updated });

  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
