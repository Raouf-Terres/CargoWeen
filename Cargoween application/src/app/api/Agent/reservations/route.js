import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';


export async function POST(request) {
  const uri = "mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/";
  let client;

  try {
    const formData = await request.formData();

    // Récupération des données
    const companyData = JSON.parse(formData.get('companyData'));
    const userId = formData.get('userId');
    const userName = formData.get('userName');
    const userEmail = formData.get('userEmail');
    const userPhone = formData.get('userPhone');
    const deliveryAddress = formData.get('deliveryAddress');

    // Récupération des fichiers
    const pdfInitial = formData.get('pdfInitial');
    const facture = formData.get('facture');
    const bonLivraison = formData.get('bonLivraison');
    const euri = formData.get('euri');
    const fds = formData.get('fds');
    const autresFiles = formData.getAll('autres');
    const recueAvion = formData.get('recueAvion');
    // Vérification des fichiers obligatoires
    if (!facture || !bonLivraison || !recueAvion) {
      return NextResponse.json(
        { success: false, error: 'Facture, Bon de livraison et recue avion sont obligatoires' },
        { status: 400 }
      );
    }

    // Fonction pour sauvegarder un fichier
    const saveFile = async (file, folder) => {
      if (!file) return null;
      try {
        const buffer = file instanceof File
          ? Buffer.from(await file.arrayBuffer())
          : file;
        const timestamp = Date.now();
        const originalName = file.name || `${folder}_${timestamp}`;
        const ext = path.extname(originalName) || '.pdf';
        const filename = `${folder}_${timestamp}${ext}`;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filePath, buffer);

        return `/uploads/${filename}`;
      } catch (err) {
        console.error(`Error saving ${folder} file:`, err);
        return null;
      }
    };

    // Sauvegarde des fichiers
    const savedFiles = {
      pdfInitial: pdfInitial ? await saveFile(pdfInitial, 'initial') : null,
      facture: await saveFile(facture, 'facture'),
      bonLivraison: await saveFile(bonLivraison, 'bonLivraison'),
      recueAvion: await saveFile(recueAvion, 'recueAvion'),
      euri: euri ? await saveFile(euri, 'euri') : null,
      fds: fds ? await saveFile(fds, 'fds') : null,
      autres: await Promise.all(
        autresFiles.map((file, index) =>
          file ? saveFile(file, `autre_${index}`) : null
        )
      ).then(files => files.filter(Boolean))
    };

    // Connexion à MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("ReservationsAgent");

    // Création de la réservation
    const reservation = {
      userId,
      userName,
      userEmail,
      userPhone,
      companyId: companyData.id,
      companyName: companyData.CompanyName,
      deliveryAddress,
      tarifTotal: companyData.TarifTotal,
      prixKm: companyData.PrixKM,
      prixArrivee: companyData.PrixArrivee,
      douane: companyData.Douane,
      distanceLivraison: companyData.DeliveryDistance,
      files: savedFiles,
      status: 'en attente',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insertion dans MongoDB
    const result = await collection.insertOne(reservation);

    // Émission Socket.io
    
    const paymentResponse = await fetch(`http://localhost:3000/api/Agent/konnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: result.insertedId,
        tarifTotal: companyData.TarifTotal,
        userName,
        userEmail,
        userPhone
      }),
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      console.error('Erreur paiement:', errorData);

      const paymentData = await paymentResponse.json();

      // Mettre à jour avec le paymentRef et l'URL de paiement
      await collection.updateOne(
        { _id: result.insertedId },
        {
          $set: {
            paymentRef: paymentData.paymentId,
            paymentStatus: "Payée",
            paymentUrl: paymentData.paymentUrl,
            status: 'en attente'
          }
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: errorData.message,
          reservationId: result.insertedId
        },
        { status: 400 }
      );
    }

    const paymentData = await paymentResponse.json();

    // Retournez l'URL de paiement
    return NextResponse.json({
      success: true,
      reservationId: result.insertedId,
      paymentUrl: paymentData.paymentUrl
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}