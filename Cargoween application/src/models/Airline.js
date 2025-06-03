import mongoose from "mongoose";

const AirlineSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
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
  iataAirportCode: { type: String, required: true }, // ✅ Assurez-vous du nom exact
  airlineCode: { type: String, required: true },
  iataCode: { type: String, required: true }, // ✅ Assurez-vous du nom exact
  password: { type: String, required: true },
  role: { type: String, default: "airline" },
   // Ajout des champs pour la vérification par e-mail
 verificationCode: { type: Number, default: null }, // Code temporaire
 verificationCodeExpires: { type: Date, default: null }, // Expiration du code
 isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Airline || mongoose.model("Airline", AirlineSchema);
