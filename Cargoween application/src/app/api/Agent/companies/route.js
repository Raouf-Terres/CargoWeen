//api/companies/route.js
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('id');

  if (!companyId) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'ID de société requis' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const uri = "mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("transitaires");

    if (!ObjectId.isValid(companyId)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Format ID invalide' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const company = await collection.findOne({ 
      _id: new ObjectId(companyId) 
    });

    if (!company) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Société non trouvée' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Formatage des données en utilisant les bons noms de champs
    const responseData = {
      success: true,
      data: {
        _id: company._id.toString(),
        CompanyName: company["company"], // Champ avec espace dans la base
        PostalAddress: company["address"],
        Phone: company["phone"], // Champ différent dans la base
        Email: company["email"], // Champ différent dans la base
        Website: company["website"], // Champ différent dans la base
        PrixKM: company["prixKm"], // Champ avec espace
        PrixArrivee: company["prixArrivee"], // Champ avec espace et accent
        Douane: company["douane"],
        
      }
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}