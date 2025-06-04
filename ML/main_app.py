import io
import os
import re
import json
import sys
from tkinter import filedialog, simpledialog
import requests
import pytesseract
from pdf2image import convert_from_path
from pymongo import MongoClient
from transformers import pipeline, CamembertTokenizer, CamembertForTokenClassification
from PIL import Image
import numpy as np
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from geopy.distance import geodesic
from pymongo.server_api import ServerApi
import time
import joblib
import tkinter as tk

# Configuration OpenRouteService
ORS_API_KEY = "5b3ce3597851110001cf6248c5a8638eac034281a7d233d33622d354"
ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car"
REQUEST_DELAY = 1.5

# Cache pour les distances
DISTANCE_CACHE_FILE = "distance_cache.json"
GEOCODING_CACHE_FILE = "geocoding_cache.json"
# Configurer l'encodage UTF-8 pour stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# Initialisation des caches
def init_cache(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_cache(filename, cache):
    with open(filename, 'w') as f:
        json.dump(cache, f)

distance_cache = init_cache(DISTANCE_CACHE_FILE)
geocoding_cache = init_cache(GEOCODING_CACHE_FILE)

# Initialisation des modèles CamemBERT
nlp = pipeline("fill-mask", model="camembert-base")
tokenizer = CamembertTokenizer.from_pretrained("camembert-base")
ner_tokenizer = CamembertTokenizer.from_pretrained("Jean-Baptiste/camembert-ner")
ner_model = CamembertForTokenClassification.from_pretrained("Jean-Baptiste/camembert-ner")
ner_pipeline = pipeline("ner", model=ner_model, tokenizer=ner_tokenizer, grouped_entities=True)




def get_user_input(pdf_path, delivery_address):
    """Valide simplement les entrées"""
    if not pdf_path or not delivery_address:
        raise ValueError("Chemin PDF et adresse sont requis")
    return pdf_path, delivery_address


def process_text_with_camembert(text):
    tokens = tokenizer.encode(text, add_special_tokens=False)
    chunk_size = 510
    corrected_text = []
    for i in range(0, len(tokens), chunk_size):
        chunk = tokens[i:i + chunk_size]
        chunk_text = tokenizer.decode(chunk)
        if tokenizer.mask_token in chunk_text:
            masked_text = chunk_text
        else:
            words = chunk_text.split()
            if len(words) > 3:
                words[2] = tokenizer.mask_token
                masked_text = " ".join(words)
            else:
                print("Texte trop court pour appliquer un masque. Texte ignoré.")
                corrected_text.append(chunk_text)
                continue
        try:
            predictions = nlp(masked_text)
            corrected_text.append(predictions[0]["sequence"])
        except Exception as e:
            print(f"Erreur lors de la prédiction avec CamemBERT : {e}")
            corrected_text.append(chunk_text)
    return " ".join(corrected_text)

def extract_entities_with_camembert(text):
    entities = ner_pipeline(text)
    for entity in entities:
        if "score" in entity:
            entity["score"] = float(entity["score"])
    return entities

def ocr_pytesseract(image):
    return pytesseract.image_to_string(image, lang="eng")

def extract_page1_info(text):
    text = re.sub(r'\s+', ' ', text).strip()
    match_flight = re.search(r'Compagnie Numéro de vol Départ Arrivée (.*?) (.*?) (\d{2}:\d{2}) (\d{2}:\d{2})', text)
    match_details = re.search(r'Quantité Dimensions Poids/Unité Poids Taxable/Unité Gerbable Dangereux (\d+) ([\dxX ]+CM) (\d+ KG) (\d+ KG) (\w+) (\w+)', text)
        
        # Nouvelle regex modifiée pour gérer les dates avec ou sans espace après la virgule
    match_dates = re.findall(r'(\d{1,2} [A-Za-z]{3},\s?\d{4})', text)
        
    info = {
            "Heure de Départ": match_flight.group(3) if match_flight else "Non trouvé",
            "Heure d'Arrivée": match_flight.group(4) if match_flight else "Non trouvé",
            "Quantité": match_details.group(1) if match_details else "Non trouvé",
            "Dimensions": match_details.group(2) if match_details else "Non trouvé",
            "Poids/Unité": match_details.group(3) if match_details else "Non trouvé",
            "Poids Taxable/Unité": match_details.group(4) if match_details else "Non trouvé",
            "Gerbable": match_details.group(5) if match_details else "Non trouvé",
            "Dangereux": match_details.group(6) if match_details else "Non trouvé",
            "Date de départ": match_dates[0] if match_dates else "Non trouvé",
            "Date d'arrivée": match_dates[1] if len(match_dates) > 1 else match_dates[0] if match_dates else "Non trouvé"
        }
    return info

def extract_page2_info(text):
    text = re.sub(r'\s+', ' ', text).strip()
    data = {}
    match = re.search(r"Nom\s*([A-Z]+\s*/\s*[A-Z]+)", text)
    data["Nom"] = match.group(1) if match else "Non trouvé"
    match = re.search(r"Numéro\s*de\s*vol\s*([A-Z0-9]+)", text)
    data["Numéro de vol"] = match.group(1) if match else "Non trouvé"
    match = re.search(r"Aéroport\s*de\s*départ\s*([A-Z]+)", text)
    data["Aéroport de départ"] = match.group(1) if match else "Non trouvé"
    match = re.search(r"Aéroport\s*d’arrivée\s*([A-Z]+)", text)
    data["Aéroport d’arrivée"] = match.group(1) if match else "Non trouvé"
    match = re.search(r"Total\s*(\d+\s*TND)", text)
    data["Total"] = match.group(1) if match else "Non trouvé"
    match = re.search(r"Nom\s*compagnie\s*aérienne\s*([A-Z\s]+)\s*Transitaire", text)
    data["Nom compagnie aérienne"] = match.group(1).strip() if match else "Non trouvé"
    match = re.search(r"Transitaire\s*([A-Z\s]+)\s*Numéro\s*LTA", text)
    data["Transitaire"] = match.group(1).strip() if match else "Non trouvé"
    match = re.search(r"Numéro\s*LTA\s*([A-Z0-9]+)", text)
    data["Numéro LTA"] = match.group(1) if match else "Non trouvé"
    return data
def get_airport_info(iata_code):
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {"format": "json", "q": f"{iata_code} airport", "limit": 1}
        headers = {"User-Agent": "My-Airport-App/1.0"}
        response = requests.get(url, params=params, headers=headers)

        if response.status_code != 200:
            return {"Nom de l'aéroport": "Non trouvé", "Latitude": "Non trouvé", "Longitude": "Non trouvé"}

        data = response.json()
        if data:
            airport = data[0]
            return {
                "Nom de l'aéroport": airport.get("display_name", "Non trouvé"),
                "Latitude": airport.get("lat", "Non trouvé"),
                "Longitude": airport.get("lon", "Non trouvé"),
            }
        else:
            return {"Nom de l'aéroport": "Non trouvé", "Latitude": "Non trouvé", "Longitude": "Non trouvé"}

    except Exception as e:
        print(f"Erreur lors de la récupération des informations de l'aéroport : {e}")
        return {"Nom de l'aéroport": "Non trouvé", "Latitude": "Non trouvé", "Longitude": "Non trouvé"}

def process_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        print(f"Erreur : Le fichier {pdf_path} n'existe pas.")
        return {}

    try:
        images = convert_from_path(pdf_path)
        if not images:
            print("Erreur : Impossible de convertir le PDF en images.")
            return {}

        results = {}

        for i, image in enumerate(images):
            text_tesseract = ocr_pytesseract(image)
            text_combined = text_tesseract
            print(f"--- Texte extrait de la page {i + 1} ---\n{text_combined}")

            text_corrected = process_text_with_camembert(text_combined)
            print(f" --- Texte corrigé avec CamemBERT ---\n{text_corrected}")

            entities = extract_entities_with_camembert(text_corrected)
            print(f"🔎 --- Entités nommées extraites ---\n{entities}")

            if i == 0:
                results.update(extract_page1_info(text_corrected))
            elif i == 1:
                results.update(extract_page2_info(text_corrected))

        if "Aéroport d’arrivée" in results and results["Aéroport d’arrivée"] != "Non trouvé":
            print(f"Recherche des infos pour {results['Aéroport d’arrivée']}...")
            airport_info = get_airport_info(results["Aéroport d’arrivée"])
            results.update(airport_info)



        print("\n=== RÉSULTATS FINAUX ===")
        for key, value in results.items():
            print(f"{key}: {value}")

        return results

    except Exception as e:
        print(f"Erreur lors du traitement du PDF : {e}")
        return {}

def cached_geocode(query):
    if query in geocoding_cache:
        return geocoding_cache[query]
    
    geolocator = Nominatim(user_agent="delivery_app_cache", timeout=10)
    location = geolocator.geocode(query)
    
    if location:
        geocoding_cache[query] = (location.latitude, location.longitude)
        save_cache(GEOCODING_CACHE_FILE, geocoding_cache)
        return (location.latitude, location.longitude)
    return None

def get_road_distance(start_coords, end_coords):
    cache_key = f"{start_coords[0]},{start_coords[1]}_{end_coords[0]},{end_coords[1]}"
    
    if cache_key in distance_cache:
        return distance_cache[cache_key]
    
    time.sleep(REQUEST_DELAY)
    
    try:
        headers = {
            'Authorization': ORS_API_KEY,
            'Content-Type': 'application/json'
        }
        body = {
            "coordinates": [
                [start_coords[1], start_coords[0]],
                [end_coords[1], end_coords[0]]
            ],
            "instructions": False
        }
        
        response = requests.post(ORS_API_URL, json=body, headers=headers, timeout=15)
        data = response.json()
        
        if response.status_code == 200:
            distance = data['routes'][0]['summary']['distance'] / 1000
            distance_cache[cache_key] = distance
            save_cache(DISTANCE_CACHE_FILE, distance_cache)
            return distance
        else:
            print(f"Erreur ORS: {data.get('error', 'Unknown error')}")
            return None
            
    except Exception as e:
        print(f"Erreur requête ORS: {str(e)}")
        return None

def calculate_delivery_distance(airport_coords, delivery_address):
    try:
        # Vérification des coordonnées
        if not airport_coords or 'latitude' not in airport_coords or 'longitude' not in airport_coords:
            raise ValueError("Coordonnées d'aéroport manquantes ou incomplètes")
            
        airport_lat = float(airport_coords['latitude'])
        airport_lon = float(airport_coords['longitude'])
        
        # Géocodage avec cache
        coords = cached_geocode(delivery_address)
        if not coords:
            raise ValueError("Adresse non trouvée")
        dest_lat, dest_lon = coords
        
        # Calcul de distance
        road_distance = get_road_distance(
            (airport_lat, airport_lon),
            (dest_lat, dest_lon)
        )
        
        if road_distance is None:
            air_distance = geodesic((airport_lat, airport_lon), (dest_lat, dest_lon)).km
            correction = 1.4 if "Paris" in delivery_address else 1.25
            road_distance = air_distance * correction
            print(f" Estimation: {air_distance:.2f} km × {correction} = {road_distance:.2f} km")
        
        print(f"\nDistance calculée:")
        print(f"- Aéroport: ({airport_lat}, {airport_lon})")
        print(f"- Livraison: ({dest_lat}, {dest_lon})")
        print(f"- Distance routière: {road_distance:.2f} km")
        
        return road_distance
        
    except Exception as e:
        print(f"Erreur calcul distance: {str(e)}")
        return None
    

def geocode_addresses(df):
    if 'address' not in df.columns:
        return df
    
    geolocator = Nominatim(
        user_agent="MonAppGeo_v1",
        timeout=10,
        domain="nominatim.openstreetmap.org"
    )
    
    geocode = RateLimiter(
        geolocator.geocode,
        min_delay_seconds=2,
        max_retries=2,
        error_wait_seconds=5
    )
    
    locations = []
    total = len(df)
    success = 0
    
    print(f"\nDébut du géocodage de {total} adresses...")
    
    for idx, row in df.iterrows():
        try:
            query = f"{row.get('city', '')}, {row.get('country', '')}"
            time.sleep(1)
            location = geocode(query)
            
            if location:
                success += 1
                locations.append({
                    'latitude': location.latitude,
                    'longitude': location.longitude
                })
            else:
                locations.append({'latitude': None, 'longitude': None})
                
        except Exception as e:
            print(f"Erreur de géocodage pour l'entrée {idx}: {str(e)}")
            locations.append({'latitude': None, 'longitude': None})
    
    geo_df = pd.DataFrame(locations)
    print(f"Géocodage terminé. Taux de réussite: {success}/{total} ({success/total:.1%})")
    
    return pd.concat([df, geo_df], axis=1)

def find_nearest_companies(df, latitude, longitude):
    if 'latitude' not in df.columns or 'longitude' not in df.columns:
        raise ValueError("Coordonnées manquantes")
    
    valid_df = df[df['latitude'].notna() & df['longitude'].notna()].copy()
    
    if valid_df.empty:
        raise ValueError("Aucune société avec coordonnées valides")
    
    valid_df['air_distance'] = valid_df.apply(
        lambda row: geodesic((latitude, longitude), (row['latitude'], row['longitude'])).km,
        axis=1
    )
    valid_df = valid_df.nsmallest(10, 'air_distance')
    
    distances = []
    for _, row in valid_df.iterrows():
        dist = get_road_distance(
            (latitude, longitude),
            (row['latitude'], row['longitude'])
        )
        distances.append(dist if dist is not None else row['air_distance'] * 1.2)
    
    valid_df['distance_km'] = distances
    return valid_df.nsmallest(5, 'distance_km')

def calculate_tariffs(df, nearest_companies, delivery_distance_km,  delivery_coords=None):
    tariffs = []
    for _, company in nearest_companies.iterrows():
        prix_km = float(company['prixKm'])
        prix_arrivee = float(company['prixArrivee'])
        douane = float(company['douane'])
        
        tarif = (delivery_distance_km * prix_km) + prix_arrivee + douane

        delivery_details = {
            'From Airport': {
                'latitude': company.get('latitude', None),
                'longitude': company.get('longitude', None)
            },
            'To Destination': delivery_distance_km
        }
        
        if delivery_coords:
            delivery_details['Destination'] = {
                'latitude': delivery_coords[0],
                'longitude': delivery_coords[1]
            }
        
        tariffs.append({
            'Company ID': str(company['_id']),
            'Company Name': company['company'],
            'Postal Address': company['address'],
            'Distance to Airport (km)': company['distance_km'],
            'Delivery Distance (km)': delivery_distance_km,
            'Prix KM': prix_km,
            'Prix arrivée': prix_arrivee,
            'Douane': douane,
            'Tarif Total (Euro)': round(tarif, 2),
            'Company Latitude': company.get('latitude', None),  # Ajout de la latitude
            'Company Longitude': company.get('longitude', None),  # Ajout de la longitude
            'Delivery Distance Details': delivery_details
        })
    
    return pd.DataFrame(tariffs)

def load_model():
    if not os.path.exists("best_model.pkl"):
        raise FileNotFoundError("Le fichier best_model.pkl n'existe pas. Veuillez d'abord exécuter train_model.py")
    
    return joblib.load("best_model.pkl")

def apply_ml_model(model, df, delivery_info):
    """
    Applique le modèle ML pour prédire les meilleures sociétés
    """
    try:
        # Préparation des features pour le modèle
        features = pd.DataFrame({
            'distance_km': df['Distance to Airport (km)'],
            'delivery_distance': df['Delivery Distance (km)'],
            'price_per_km': df['Prix KM'],
            'base_price': df['Prix arrivée'],
            'customs_fee': df['Douane'],
            'total_price': df['Tarif Total (Euro)']
        })
        
        # Prédiction avec le modèle
        predictions = model.predict(features)
        df['ML_Score'] = predictions
        
        # Tri par score ML (meilleurs scores en premier)
        df = df.sort_values('ML_Score', ascending=False)
        
        return df
    except Exception as e:
        print(f"Erreur lors de l'application du modèle ML: {str(e)}")
        return df

def find_nearest_companies_ui(df, airport_coords=None, delivery_address=None):
    print("\n" + "="*60)
    print("SYSTÈME DE CALCUL DE TARIFS OPTIMISÉ".center(60))
    print("="*60)
    
    try:
        # Vérification des coordonnées d'aéroport
        if not airport_coords:
            raise ValueError("Coordonnées d'aéroport manquantes")
            
        if 'latitude' not in airport_coords or 'longitude' not in airport_coords:
            raise ValueError("Coordonnées d'aéroport incomplètes")
            
        try:
            airport_lat = float(airport_coords['latitude'])
            airport_lon = float(airport_coords['longitude'])
        except (ValueError, TypeError):
            raise ValueError("Coordonnées d'aéroport invalides")
        
        # Trouver les sociétés proches
        nearest = find_nearest_companies(df, airport_lat, airport_lon)
        
        print("\nTop 5 des sociétés les plus proches:")
        print(nearest[['_id', 'company', 'address', 'distance_km']].to_string(index=False))
        
        # Calcul de la distance de livraison
        if delivery_address:
        # Géocoder l'adresse de livraison
            delivery_coords = cached_geocode(delivery_address)
            distance = calculate_delivery_distance({
                'latitude': airport_lat,
                'longitude': airport_lon
            }, delivery_address)
        
            if distance:
                tariffs = calculate_tariffs(df, nearest, distance, delivery_coords)
                tariffs = tariffs.sort_values('Distance to Airport (km)')
                
                print("\nComparaison des tarifs (triés par proximité à l'aéroport):")
                print(tariffs.to_string(index=False))
                
                results = {
                    "companies": tariffs.to_dict('records'),
                    "airportCoords": {
                        "latitude": airport_lat,
                        "longitude": airport_lon,
                    },
                    "deliveryDistance": distance
                }
                
                print("\nRésultats finaux prêts pour l'API:")
                print(json.dumps(results, indent=2, ensure_ascii=False))
                
                return results
                
    except Exception as e:
        print(f"\nErreur: {str(e)}")
        return {"error": str(e)}

def main():
    # 1. Récupérer les arguments en ligne de commande
    if len(sys.argv) < 3:
        print("Usage: python main_app.py <pdf_path> <delivery_address> [--output output.json]")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    delivery_address = sys.argv[2]
    
    # 2. Valider les entrées (supprimez l'appel à get_user_input() si vous ne voulez plus de tkinter)
    try:
        pdf_path, delivery_address = get_user_input(pdf_path, delivery_address)
    except ValueError as e:
        print(f"Erreur: {str(e)}")
        return
    
    # 3. Traiter le PDF
    pdf_data = process_pdf(pdf_path)
    if not pdf_data:
        print("Erreur lors du traitement du PDF")
        return

    # 4. Configuration MongoDB
    MONGO_CONNECTION_STRING = "mongodb+srv://Cargoween:raouf123456@cluster0.ckkymmz.mongodb.net/"
    DB_NAME = "test"
    COLLECTION_NAME = "transitaires"

    try:
        client = MongoClient(MONGO_CONNECTION_STRING)
        db = client[DB_NAME]
        df = pd.DataFrame(list(db[COLLECTION_NAME].find({})))
        
        # 5. Utiliser les données extraites du PDF
        airport_coords = {}
        if 'Latitude' in pdf_data and 'Longitude' in pdf_data:
            airport_coords = {
                'latitude': pdf_data['Latitude'],
                'longitude': pdf_data['Longitude']
            }
        elif 'latitude' in pdf_data and 'longitude' in pdf_data:
            airport_coords = {
                'latitude': pdf_data['latitude'],
                'longitude': pdf_data['longitude']
            }
        else:
            print("Erreur: Coordonnées d'aéroport non trouvées dans les données PDF")
            return
        
        # 6. Géocodage des adresses
        try:
            print("\nÉtape 2: Tentative de géocodage des adresses...")
            df = geocode_addresses(df)
            if 'latitude' in df.columns:
                success_count = df['latitude'].notnull().sum()
                print(f"\nGéocodage partiellement réussi - {success_count}/{len(df)} adresses géocodées")
        except Exception as e:
            print(f"\nAttention: Erreur lors du géocodage: {str(e)}")
            df['latitude'] = df.get('latitude', None)
            df['longitude'] = df.get('longitude', None)
            
        # 7. Trouver les sociétés les plus proches
        results = find_nearest_companies_ui(
            df=df,
            airport_coords=airport_coords,
            delivery_address=delivery_address
        )
        
        if '--output' in sys.argv:
            output_index = sys.argv.index('--output') + 1
            if output_index < len(sys.argv):
                with open(sys.argv[output_index], 'w') as f:
                    json.dump(results, f)
        
        return results
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        client.close()

if __name__ == "__main__":
    main()
