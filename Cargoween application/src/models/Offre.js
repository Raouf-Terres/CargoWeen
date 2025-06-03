import mongoose from "mongoose";

const OffreSchema = new mongoose.Schema({
  compagnie: { type: String, required: true },
  tarifParKg: { type: Number, required: true }, // €/kg
  surchargeFuel: { type: Number, default: 0 }, // €/kg si existant
}, { timestamps: true });

export default mongoose.models.Offre || mongoose.model("Offre", OffreSchema);
