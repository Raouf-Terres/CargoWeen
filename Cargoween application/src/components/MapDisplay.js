'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Configuration des icônes Leaflet
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/marker-icon-2x.png',
      iconUrl: '/marker-icon.png',
      shadowUrl: '/marker-shadow.png',
    });
    return L;
  }
  return null;
};

// Composants dynamiques
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

const createIcon = (iconUrl) => {
  const L = fixLeafletIcons();
  if (!L) return null;
  
  return new L.Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export default function MapDisplay({ 
  companies = [], 
  airportCoords = { lat: 0, lng: 0 },
  selectedCompany = null,
  deliveryAddress = { lat: 0, lng: 0 }
}) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setL(require('leaflet'));
      fixLeafletIcons();
    }
  }, []);

  const isValidCoord = (coord) => {
    return coord && !isNaN(coord) && coord !== 0;
  };

  const validCompanies = companies.filter(company => {
    return isValidCoord(company.latitude) && 
           isValidCoord(company.longitude);
  });

  const getCenter = () => {
    if (selectedCompany && isValidCoord(selectedCompany.latitude)) {
      return [selectedCompany.latitude, selectedCompany.longitude];
    }
    
    if (isValidCoord(airportCoords.lat) && isValidCoord(airportCoords.lng)) {
      return [airportCoords.lat, airportCoords.lng];
    }
    if (validCompanies.length > 0) {
      return [
        validCompanies[0].latitude, 
        validCompanies[0].longitude
      ];
    }
    return [46.603354, 1.888334]; // Centre de la France par défaut
  };

  const getZoom = () => {
    if (selectedCompany) return 12;
    if (validCompanies.length > 5) return 6;
    if (validCompanies.length > 0) return 8;
    return 5;
  };

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '500px' }}>
      <MapContainer
        center={getCenter()}
        zoom={getZoom()}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Marqueur de l'aéroport */}
        {isValidCoord(airportCoords.lat) && isValidCoord(airportCoords.lng) && (
          <Marker
            position={[airportCoords.lat, airportCoords.lng]}
            icon={createIcon('/airport-marker.png')}
          >
            <Popup>Aéroport de départ</Popup>
          </Marker>
        )}

        
        

{validCompanies.map((company) => {
    const deliveryCoords = company.deliveryCoordinates?.Destination;
    const hasDeliveryCoords = deliveryCoords && 
                           isValidCoord(deliveryCoords.latitude) && 
                           isValidCoord(deliveryCoords.longitude);

          return (
            <div key={company.id || company.CompanyName}>
              {/* Marqueur de l'entreprise */}
              <Marker
                position={[company.latitude, company.longitude]}
                icon={createIcon(
                  selectedCompany && selectedCompany.id === company.id 
                    ? '/company-marker.png' 
                    : '/company-marker.png'
                )}
              >
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#3F6592' }}>
                      {company.CompanyName}
                    </h4>
                    <p style={{ margin: '3px 0' }}>
                      <strong>Adresse:</strong> {company.PostalAddress}
                    </p>
                    <p style={{ margin: '3px 0' }}>
                      <strong>Distance aéroport:</strong> {company.DistanceToAirport?.toFixed(2)} km
                    </p>
                    <p style={{ margin: '3px 0' }}>
                      <strong>Tarif:</strong> {company.TarifTotal?.toFixed(2)} €
                    </p>
                    {hasDeliveryCoords && (
                      <p style={{ margin: '3px 0', color: '#4CAF50' }}>
                        <strong>Distance livraison:</strong> {company.DeliveryDistance?.toFixed(2)} km
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Marqueur du point de livraison et ligne de connexion */}
              {hasDeliveryCoords && (
                <>
                  <Marker 
              position={[deliveryCoords.latitude, deliveryCoords.longitude]}
              icon={createIcon('/delivery-marker.png')}
            >
              <Popup>Adresse de livraison </Popup>
            </Marker>
            
            <Polyline
              positions={[
                [airportCoords.lat, airportCoords.lng],
                [deliveryCoords.latitude, deliveryCoords.longitude]
              ]}
              color={ '#3F6592'}
              weight={2}
              opacity={0.7}
            />
                </>
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}