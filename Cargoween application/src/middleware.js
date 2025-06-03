import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; 

export async function middleware(req) {
  const token = req.cookies.get("token")?.value; // Récupère le token

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url)); // Redirection vers login si pas de token
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)); 
    return NextResponse.next(); // Permet l'accès
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url)); // Redirection si token invalide
  }
}

// 🔹 Appliquer le middleware uniquement aux pages protégées
export const config = {
  matcher: ["/Transitaire/:path*", "/Administrateur/:path*", "/Airline/:path*"], 

  
};
