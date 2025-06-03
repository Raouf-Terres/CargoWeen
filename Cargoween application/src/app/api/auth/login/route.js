import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Transitaire from "@/models/Transitaire";
import Airline from "@/models/Airline";
import Admin from "@/models/Admin";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectToDatabase();

    // Vérifier dans Admin
    let user = await Admin.findOne({ email });

    // Vérifier dans Transitaire si pas Admin
    if (!user) {
      user = await Transitaire.findOne({ email });
    }

    // Vérifier dans Airline si pas Admin ni Transitaire
    if (!user) {
      user = await Airline.findOne({ email });
    }

    if (!user) {
      return new Response(JSON.stringify({ message: "Utilisateur non trouvé" }), { status: 404 });
    }

    // Vérifier mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: "Mot de passe incorrect" }), { status: 401 });
    }

    // Générer le token JWT
    const tokenPayload = { id: user._id, email: user.email, role: user.role };

    if (user instanceof Admin) {
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

      return new Response(
        JSON.stringify({ message: "Connexion réussie", token, role: "admin" }),
        { status: 200 }
      );
    }

    // Si Transitaire ou Airline vérifié
    if (user.isVerified) {
      const token = jwt.sign(
        { ...tokenPayload, isVerified: true },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return new Response(
        JSON.stringify({ message: "Connexion réussie", token, role: user.role, isVerified: true }),
        { status: 200 }
      );
    }

    // Si pas vérifié, générer code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    console.log(`📩 Code généré pour ${email} :`, verificationCode);

    const model = user instanceof Transitaire ? Transitaire : Airline;

    await model.findByIdAndUpdate(user._id, {
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Envoyer le mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support Cargoween" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Vérification de connexion",
      html: `<p>Votre code de vérification est : <strong>${verificationCode}</strong></p>`,
    });

    return new Response(
      JSON.stringify({ message: "Code de vérification envoyé", email, isVerified: false }),
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
