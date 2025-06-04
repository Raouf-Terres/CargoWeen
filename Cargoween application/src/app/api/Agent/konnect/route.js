import { MongoClient , ObjectId } from 'mongodb';
let client;
export const POST = async (req) => {
  try {
    const body = await req.json();

    const {
      reservationId,
      tarifTotal, 
      userName,
      userEmail,
      userPhone
    } = body;

    const EUR_TO_TND = 3.3;
    const amountTND = tarifTotal * EUR_TO_TND;
    const amountMillimes = Math.round(amountTND * 1000);

    const payload = {
      receiverWalletId: '683b1c579c00b21d0c81377e',
      token: "TND",
      amount: amountMillimes,
      type: "immediate",
      description: `Paiement réservation ${reservationId} : ${tarifTotal.toFixed(2)} € ≈ ${amountTND.toFixed(3)} TND`,
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      lifespan: 15,
      checkoutForm: true,
      addPaymentFeesToAmount: true,
      userName,
      userEmail,
      userPhone,
      orderId: reservationId,
      webhook: "https://d39e-197-3-154-93.ngrok-free.app/api/konnect/webhook",
      silentWebhook: true,
      theme: "light",
      successUrl: `http://localhost:3000/Agent/payment-success`,
      failUrl: `http://localhost:3000/Agent/payment-failure`
    };

    const resp = await fetch('https://api.sandbox.konnect.network/api/v2/payments/init-payment', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "683b1c579c00b21d0c813775:uqukmU4HJkHKMbnib",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Erreur Konnect:", errorText);
      throw new Error(errorText);
    }

    const data = await resp.json();

    // Mettre à jour la réservation avec le paymentRef
    const uri = 'mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/';
    client = new MongoClient(uri);
    await client.connect();
    await client.db("test")
  .collection("ReservationsAgent")
  .updateOne(
    { _id: new ObjectId(reservationId) }, // Convertir en ObjectId
    { $set: { 
      paymentRef: data.paymentRef,
      paymentStatus: "Payée",
      paymentUrl: data.payUrl,
      updatedAt: new Date() // Ajouter ce champ
    }}
  );

    return new Response(JSON.stringify({
      paymentUrl: data.payUrl,
      paymentId: data.paymentRef,
      displayedAmount: tarifTotal.toFixed(2) + " €",
    }), { status: 200 });

  } catch (err) {
    console.error("Erreur:", err);
    return new Response(JSON.stringify({ 
      message: err.message || "Erreur serveur paiement" 
    }), { status: 500 });
  }
};