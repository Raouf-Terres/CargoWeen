import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Transitaire", required: true },
  marchandise: { type: mongoose.Schema.Types.ObjectId, ref: "Marchandise", required: true },
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureDate: { type: Date, required: true },
  arrivalDate: { type: Date, required: true },
  tarif: { type: Number, required: true },
  totalWeight: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  awb: { type: String, default: "" },
    awbType: {
  type: String,
  enum: ["Paper AWB", "EAP", "EAW"],
  default: undefined
},
awbComment: {
  type: String,
  default: ""
},
  etat: {
    type: String,
    enum: ["En attente", "Acceptée", "Annulée"],
    default: "En attente"
  },  status: {
    type: String,
    enum: ["Non payé", "Payée", "Échouée"],
    default: "Non payé"
  },
  paymentRef: { type: String, default: null }

}, { timestamps: true });

export default mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);
