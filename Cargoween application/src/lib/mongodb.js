import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ MONGODB_URI n'est pas défini dans .env.local");
}

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté à MongoDB !");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB :", error);
  }
};
