// app/api/amadeus/flights/route.js

import axios from 'axios';
import { getAccessToken } from '@/lib/amadeus';

export async function POST(request) {
  try {
    const { origin, destination, date } = await request.json();
    const token = await getAccessToken();

    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: 1,
      },
    });

    return new Response(JSON.stringify(response.data.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de vols :', error.response?.data || error.message);
    return new Response(JSON.stringify({ message: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
