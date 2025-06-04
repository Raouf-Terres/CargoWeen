//app/api/process-pdf/route.js
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  let filepath;
  try {
    console.log('Début du traitement du PDF...');

    // Créer un dossier temp s'il n'existe pas
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Recevoir le fichier
    const formData = await request.formData();
    const file = formData.get('pdf');
    const deliveryAddress = formData.get('deliveryAddress');
    
    if (!file) throw new Error('Aucun fichier PDF reçu');
    if (!deliveryAddress) throw new Error('Aucune adresse de livraison fournie');

    // Enregistrer le fichier temporaire
    const buffer = await file.arrayBuffer();
    filepath = path.join(tempDir, `upload_${Date.now()}.pdf`);
    await fs.writeFile(filepath, Buffer.from(buffer));

    const tempOutput = path.join(tempDir, `output_${Date.now()}.json`);

    console.log('Lancement du script Python...');
    const startTime = Date.now();

    // Chemin absolu vers le script Python
    const pythonScriptPath = path.join(process.cwd(), '../ML/main_app.py');
    
    // Vérifier que le fichier Python existe
    try {
      await fs.access(pythonScriptPath);
    } catch {
      throw new Error(`Le script Python est introuvable à l'emplacement: ${pythonScriptPath}`);
    }

    const result = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        pythonScriptPath,
        filepath,
        deliveryAddress,
        '--output', 
        tempOutput
      ]);

      const timeout = setTimeout(() => {
        pythonProcess.kill('SIGTERM');
        reject(new Error('Timeout après 30 minutes'));
      }, 1800000);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`Python stdout: ${data.toString().trim()}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`Python stderr: ${data.toString().trim()}`);
      });

      pythonProcess.on('close', async (code) => {
        clearTimeout(timeout);
        console.log(`Script exécuté en ${(Date.now() - startTime) / 1000}s`);

        if (code !== 0) {
          return reject(new Error(`Erreur Python (code ${code}): ${stderr || stdout}`));
        }

        try {
          const data = await fs.readFile(tempOutput, 'utf-8');
          resolve(JSON.parse(data));
        } catch (error) {
          // Si le fichier de sortie n'existe pas, essayer de parser stdout
          try {
            const jsonData = JSON.parse(stdout);
            resolve(jsonData);
          } catch (jsonError) {
            reject(new Error(`Impossible de lire les résultats: ${error.message}, ${jsonError.message}`));
          }
        }
      });
    });

    // Formatage des résultats pour le frontend
    const formattedResponse = {
      success: true,
      data: {
        companies: (result.companies || []).map(company => ({
          id: company['Company ID'] || null,
          name: (company['Company Name'] || 'Unknown').trim(), // Nettoyage des espaces
          address: company['Postal Address'] || 'Unknown',
          distance: company['Distance to Airport (km)'] || 0,
          price: company['Tarif Total (Euro)'] || 0,
          pricePerKm: company['Prix KM'] || 0,
          basePrice: company['Prix arrivée'] || 0,
          customsFee: company['Douane'] || 0,
          latitude: company['Company Latitude'] || 0,
          longitude: company['Company Longitude'] || 0,
          deliveryDistance: company['Delivery Distance (km)'] || 0,
          deliveryCoordinates: company['Delivery Distance Details'] ? {
            Destination: {
              latitude: company['Delivery Distance Details']['Destination']?.latitude || 0,
              longitude: company['Delivery Distance Details']['Destination']?.longitude || 0
            }
          } : null
        })),
        airportCoords: {
          latitude: result.airportCoords?.latitude || 0,
          longitude: result.airportCoords?.longitude || 0
        },
        deliveryDistance: result.deliveryDistance || 0
      }
    };
    // Nettoyage
    await Promise.allSettled([
      fs.unlink(tempOutput).catch(() => {}),
      fs.unlink(filepath).catch(() => {}),
    ]);

    return new Response(JSON.stringify(formattedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur:', error.message);
    if (filepath) await fs.unlink(filepath).catch(() => {});

    return new Response(
      JSON.stringify({
        error: 'Échec du traitement PDF',
        details: process.env.NODE_ENV === 'development' ? error.message : null,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}