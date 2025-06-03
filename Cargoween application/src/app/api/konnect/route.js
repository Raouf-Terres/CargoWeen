import { connectToDatabase } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export const POST = async (req) => {
  try {
    const body = await req.json();

    const {
      reservationId,
      amount, 
      firstName,
      lastName,
      email,
      phone
    } = body;

    const EUR_TO_TND = 3.3;
    const amountTND = amount * EUR_TO_TND;
    const amountMillimes = Math.round(amountTND * 1000); // en millimes

    const payload = {
      receiverWalletId: process.env.KONNECT_WALLET_ID,
      token: "TND",
      amount: amountMillimes,
      type: "immediate",
  description: `Paiement réservation ${reservationId} : ${amount.toFixed(2)} € ≈ ${amountTND.toFixed(3)} TND`,
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      lifespan: 15,
      checkoutForm: true,
      addPaymentFeesToAmount: true,
      firstName,
      lastName,
      phoneNumber: phone,
      email,
      orderId: reservationId,
      webhook: "https://10da-196-235-153-155.ngrok-free.app/api/konnect/webhook",
      silentWebhook: true,
      theme: "light",
      successUrl: "http://localhost:3000/payment-success",
      failUrl: "http://localhost:3000/payment-failure"
    };

    const resp = await fetch(process.env.KONNECT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.KONNECT_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const errorText = await resp.text();
      console.error("❌ Réponse non JSON de Konnect :", errorText);
      return new Response(JSON.stringify({
        message: "Konnect a retourné une réponse non JSON.",
        raw: errorText
      }), {
        status: 500
      });
    }

    const data = await resp.json();
    console.log("✅ Réponse Konnect API:", data);
// ✅ Mettre à jour la réservation avec le paymentRef
await connectToDatabase(); // Au cas où ce n'est pas déjà fait plus haut
await Reservation.findByIdAndUpdate(reservationId, {
  paymentRef: data.paymentRef,
});

    if (resp.ok && data.payUrl) {
      return new Response(JSON.stringify({
        paymentUrl: data.payUrl,
        paymentId: data.paymentRef,
        displayedAmount: amount.toFixed(2) + " €", // 👈 utile si tu veux afficher aussi depuis la réponse
      }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({
        message: data.message || "Erreur inconnue de la part de Konnect",
        raw: data,
      }), {
        status: 500,
      });
    }

  } catch (err) {
    console.error("❌ Erreur Konnect:", err);
    return new Response(JSON.stringify({ message: "Erreur serveur paiement." }), {
      status: 500,
    });
  }
};
