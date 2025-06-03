import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { adminId, firstname, lastname, address, phone } = body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { firstname, lastname, address, phone },
      { new: true }
    );

    if (!updatedAdmin) {
      return NextResponse.json({ message: "Admin non trouvé." }, { status: 404 });
    }

    return NextResponse.json({ message: "Profil mis à jour.", admin: updatedAdmin });
  } catch (err) {
    return NextResponse.json({ message: "Erreur serveur", error: err.message }, { status: 500 });
  }
}
