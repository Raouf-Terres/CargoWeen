import mongoose from "mongoose";

const TransitaireSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  company: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, required: true },
  companyID: { type: String, required: true },
  function: { type: String, required: true },
  phone: { type: String, required: true },
  cassNumber: { type: String, required: true },
  role: { type: String, default: "transitaire" }, // Ajout du rôle par défaut
 // Ajout des champs pour la vérification par e-mail
 verificationCode: { type: Number, default: null }, // Code temporaire
 verificationCodeExpires: { type: Date, default: null }, // Expiration du code
 isVerified: { type: Boolean, default: false },
 ajoutePar: { type: String, default: null },
  prixKm: { type: Number, default: null },
  prixArrivee: { type: Number, default: null },
  douane: { type: Number, default: null },
   fax: { type: String, default: null },
  website: { type: String, default: null },
  responsiblePerson: { type: String, default: null }
}, { timestamps: true });

const Transitaire = mongoose.models.Transitaire || mongoose.model("Transitaire", TransitaireSchema);

export default Transitaire;
