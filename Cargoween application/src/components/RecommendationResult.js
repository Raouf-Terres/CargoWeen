'use client';
import CompanyList from './CompanyList';
import MapDisplay from './MapDisplay';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Chargement dynamique de la carte (nécessaire pour Next.js)
const DynamicMapDisplay = dynamic(() => import('./MapDisplay'), {
  ssr: false,
  loading: () => <div className="map-loading">Chargement de la carte...</div>
});

export default function RecommendationResult({ 
  recommendations = { companies: [], airportCoords: {} },
  deliveryAddress = ''
}) {
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Normalisation des données
  const normalizedCompanies = recommendations.companies?.map(company => {
    return {
      id: company.id || company._id || Math.random().toString(36).substr(2, 9),
      CompanyName: company.companyName || company.name || 'Nom inconnu',
      PostalAddress: company.postalAddress || company.address || 'Adresse inconnue',
      DistanceToAirport: company.DistanceToAirport || company['Distance to Airport (km)'] || company.distance || 0,
      DeliveryDistance: company.DeliveryDistance || company['Delivery Distance (km)'] || company.deliveryDistance ||0,
      TarifTotal: company.TarifTotal || company['Tarif Total (Euro)'] || company.price || 0,
      PrixKM: company.PrixKM || company['Prix KM'] || 0,
      PrixArrivee: company.PrixArrivee || company['prix arrivée'] || 0,
      Douane: company.Douane || company.douane || 0,
      latitude: company.latitude || company['Company Latitude'] || 0,
      longitude: company.longitude || company['Company Longitude'] || 0,
      deliveryCoordinates: company.deliveryCoordinates || (company['Delivery Distance Details'] ? {
        Destination: {
          latitude: company['Delivery Distance Details']?.Destination?.latitude || 0,
          longitude: company['Delivery Distance Details']?.Destination?.longitude || 0
        }
      } : null)
      
    };
  }) || [];

  const normalizedAirportCoords = {
    lat: recommendations.airportCoords?.lat || recommendations.airportCoords?.latitude || 0,
    lng: recommendations.airportCoords?.lng || recommendations.airportCoords?.longitude || 0
  };

  return (
    <div className="recommendation-result">
      <h2 className="section-title">Résultats de recommandation</h2>
      
      {deliveryAddress && (
        <p className="delivery-address">
          <strong>Adresse de livraison :</strong> {deliveryAddress}
        </p>
      )}

      <div className="result-container">
        {/* Liste des sociétés */}
        <div className="company-list-container">
          <CompanyList 
            companies={normalizedCompanies} 
            onSelectCompany={setSelectedCompany}
            selectedCompany={selectedCompany}
            deliveryAddress={deliveryAddress} 
          />
        </div>

        {/* Carte */}
        <div className="map-container">
          <DynamicMapDisplay 
            companies={normalizedCompanies} 
            selectedCompany={selectedCompany}
            airportCoords={normalizedAirportCoords}
          />
        </div>
      </div>

      <style jsx>{`
        .recommendation-result {
          margin-top: 2rem;
          width: 100%;
        }
        
        .section-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .delivery-address {
          margin-bottom: 1.5rem;
          padding: 0.5rem;
          background: #f5f5f5;
          border-radius: 4px;
        }
        
        .result-container {
          display: flex;
          gap: 1.5rem;
          height: 600px;
        }
        
        .company-list-container {
          flex: 4;
          min-width: 400px;
          overflow-y: auto;
        }
        
        .map-container {
          flex: 6;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .map-loading {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
        }

        @media (max-width: 768px) {
          .result-container {
            flex-direction: column;
            height: auto;
          }
          
          .company-list-container,
          .map-container {
            flex: 1 1 100%;
            min-width: auto;
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
}