import { connectToDatabase } from "@/lib/mongodb";
import Transitaire from "@/models/Transitaire";
import Airline from "@/models/Airline";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, verificationCode } = await req.json();
    await connectToDatabase();

    console.log("📩 Vérification pour l'email :", email);
    console.log("👀 Code reçu du front :", verificationCode);

    let user = await Transitaire.findOne({ email });

    if (!user) {
      user = await Airline.findOne({ email });
    }

    if (!user) {
      console.log("❌ Utilisateur non trouvé !");
      return new Response(JSON.stringify({ message: "Utilisateur non trouvé" }), { status: 404 });
    }

    console.log("📂 Code stocké en base :", user.verificationCode);

    if (!user.verificationCode || !user.verificationCodeExpires) {
      console.log("❌ Aucun code stocké ou code expiré !");
      return new Response(JSON.stringify({ message: "Aucun code trouvé pour cet email" }), { status: 400 });
    }

    if (parseInt(verificationCode) !== user.verificationCode) {
      console.log("❌ Code incorrect ! Attendu :", user.verificationCode, "Reçu :", verificationCode);
      return new Response(JSON.stringify({ message: "Code incorrect" }), { status: 400 });
    }

    if (new Date() > user.verificationCodeExpires) {
      console.log("❌ Code expiré !");
      return new Response(JSON.stringify({ message: "Code expiré" }), { status: 400 });
    }

    const updatedUser = await (user instanceof Transitaire ? Transitaire : Airline).findByIdAndUpdate(
      user._id,
      {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
      { new: true }
    );

    console.log("✅ Utilisateur après vérification :", updatedUser);

    // ✅ Inclure explicitement le rôle dans la réponse JSON
    const token = jwt.sign(
      { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role, isVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Token généré avec `isVerified` et `role` :", token);

    return new Response(
      JSON.stringify({ 
        message: "Code vérifié avec succès", 
        token, 
        role: updatedUser.role, // ✅ Retour explicite du rôle
        isVerified: true 
      }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: error.message }),
      { status: 500 }
    );
  }
}
