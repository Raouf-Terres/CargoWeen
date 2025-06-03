import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }, // Définir un rôle admin
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;
