import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import Transitaire from "@/models/Transitaire";

export async function POST(req) {
  try {
    const { 
      email, password, confirmPassword, firstname, lastname, company, 
      country, city, address, postalCode, companyID, function: roleFunction, 
      phone, cassNumber, isSecondary = false, primaryTransitaireEmail 
    } = await req.json();

    await connectToDatabase();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Transitaire.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "Cet email est déjà utilisé" }), { status: 400 });
    }

    // Vérification du mot de passe
    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ message: "Les mots de passe ne correspondent pas !" }), { status: 400 });
    }

    // Vérification de l'ID de la compagnie (14 caractères alphanumériques)
    const regex = /^[a-zA-Z0-9]{14}$/;
    if (!regex.test(companyID)) {
      return new Response(JSON.stringify({ message: "L'ID de la compagnie doit contenir 14 caractères alphanumériques !" }), { status: 400 });
    }

    // Si c'est un transitaire secondaire, récupérer l'ID de la compagnie du principal
    let role = "transitaire"; // Par défaut, un transitaire principal
    let linkedCompanyID = companyID;
    let linkedCompanyName = company;


    if (isSecondary) {
      const primaryTransitaire = await Transitaire.findOne({ email: primaryTransitaireEmail });

      if (!primaryTransitaire) {
        return new Response(JSON.stringify({ message: "Transitaire principal non trouvé !" }), { status: 404 });
      }

      role = "transitaire-secondaire";
      linkedCompanyID = primaryTransitaire.companyID; // ✅ Le transitaire secondaire prend l'ID de la compagnie du principal
      linkedCompanyName= primaryTransitaire.company;
      var ajoutePar = `${primaryTransitaire.firstname} ${primaryTransitaire.lastname}`;

    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du transitaire
    const newTransitaire = new Transitaire({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      company: linkedCompanyName,
      country,
      city,
      address,
      postalCode,
      companyID: linkedCompanyID, //  Utilise l'ID de la compagnie du principal si secondaire
      function: roleFunction,
      phone,
      cassNumber,
      role, //  Change en "transitaire-secondaire" si besoin
      ajoutePar: isSecondary ? ajoutePar : null, // ✅ Ajouté seulement pour les secondaires

    });

    await newTransitaire.save();

    return new Response(JSON.stringify({ message: "Transitaire ajouté avec succès !" }), { status: 201 });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur", error: error.message }), { status: 500 });
  }
}
