import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  quantite: { type: Number, required: false },
  type: { type: String, enum: ["Colis", "Palette"], default: "Colis" },
  longueur: { type: Number },
  largeur: { type: Number },
  hauteur: { type: Number },
  poids: { type: Number },
  hsCode: { type: String },
  stackable: { type: Boolean, default: false },
  nature: { type: String, enum: ["chimique", "organique", "electronique"] },
  dangerous: { type: Boolean, default: false },
  tempMin: { type: Number },             // uniquement si Température contrôlée
  tempMax: { type: Number },
  humidityRange: { type: String },
  aircraftType: { type: String }         // uniquement si Cargo Aircraft
});

const MarchandiseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pieces: { type: Number, required: true },
  items: [ItemSchema],
  shipmentMode: {
    type: String,
    enum: ["Standard", "Température contrôlée", "Cargo Aircraft"],
    default: "Standard"
  },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Marchandise || mongoose.model("Marchandise", MarchandiseSchema);
