import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import Airline from "@/models/Airline";

export async function POST(req) {
  try {
    const {
      email,
      password,
      confirmPassword,
      firstname,
      lastname,
      company,
      country,
      city,
      address,
      postalCode,
      companyID,
      phone,
      function: roleFunction,
      iataAirportCode, 
      airlineCode,
      iataCode 
    } = await req.json();

    //  Connexion à MongoDB
    await connectToDatabase();

    //  Vérification si l'email existe déjà
    const existingUser = await Airline.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "Cet email est déjà utilisé !" }), { status: 400 });
    }

    //  Validation du mot de passe
    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ message: "Les mots de passe ne correspondent pas !" }), { status: 400 });
    }

    //  Validation de l'ID de la compagnie (14 caractères alphanumériques)
    const regex = /^[a-zA-Z0-9]{14}$/;
    if (!regex.test(companyID)) {
      return new Response(JSON.stringify({ message: "L'ID de la compagnie doit contenir 14 caractères alphanumériques !" }), { status: 400 });
    }

    //  Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Création de la Compagnie Aérienne avec le rôle
    const newAirline = new Airline({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      company,
      country,
      city,
      address,
      postalCode,
      companyID,
      phone,
      function: roleFunction,
      iataAirportCode, 
      airlineCode,
      iataCode, 
      role: "airline"
    });

    await newAirline.save();

    return new Response(JSON.stringify({ message: "Inscription réussie !" }), { status: 201 });

  } catch (error) {
    console.error(" Erreur dans l'API signup-airline :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur", error: error.message }), { status: 500 });
  }
}
