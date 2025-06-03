import { connectToDatabase } from "@/lib/mongodb";
import Stockawb from "@/models/Stockawb";

export const GET = async () => {
  await connectToDatabase();

  try {
    const availableAwbs = await Stockawb.find({ used: false });
    return new Response(JSON.stringify(availableAwbs), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erreur lors de la récupération" }), { status: 500 });
  }
};
