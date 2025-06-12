"use client";
import { useState, useEffect } from "react";
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUser, FaPlane } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import FlightDetailsModal from "@/components/FlightDetailsModal";
import ChatBot from '@/components/ChatBot'; 
import Toast from "@/components/Toast";




export default function Reservation() {
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [searchAirline, setSearchAirline] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  
  const [cargoData, setCargoData] = useState({
    pieces: 1,
    items: [
      {
        quantite: "",
        type: "Colis",
        longueur: "",
        largeur: "",
        hauteur: "",
        poids: "",
        hsCode: "",
        stackable: false,
        nature: "",
        dangerous: false,
        tempMin: "",         // à utiliser seulement si Température contrôlée
        tempMax: "",
        humidityRange: "",
        aircraftType: ""     // à utiliser seulement si Cargo Aircraft
      }
    ],
    notes: ""
  });
  
  
  const [shipmentMode, setShipmentMode] = useState("Standard");

  const poidsTotal = cargoData.items.reduce((acc, item) => {
    const poids = parseFloat(item.poids) || 0;
    const qte = parseInt(item.quantite) || 1;
    return acc + (poids * qte);
  }, 0);
  const airlineNames = {
    BJ: "Nouvelair",
    AZ: "ITA Airways",
    AT: "Royal Air Maroc",
    A3: "Aegean Airlines",
    TK: "Turkish Airlines",
    AF: "Air France",
    MS: "EgyptAir",
    AH: "Air Algérie",
    QR: "Qatar Airways",
    LH: "Lufthansa",
    TU: "Tunisair",
    EK: "Emirates",
    UG: "Tunisair Express",
    AA: "American Airlines",
    AC: "Air Canada",
    BA: "British Airways",
    DL: "Delta Air Lines",
    KL: "KLM Royal Dutch Airlines",
    SU: "Aeroflot Russian Airlines",
    UA: "United Airlines",
    AI: "Air India",
    QF: "Qantas Airways",
    NH: "All Nippon Airways",
    SQ: "Singapore Airlines",
    CX: "Cathay Pacific",
    KE: "Korean Air",
    ET: "Ethiopian Airlines"
  };
  
  const airports = [
    { code: "TUN", name: "Tunis-Carthage Airport", countryCode: "TN" },
    { code: "CDG", name: "Paris Charles de Gaulle", countryCode: "FR" },
    { code: "FRA", name: "Frankfurt Airport", countryCode: "DE" },
    { code: "LAX", name: "Los Angeles International", countryCode: "US" },
    { code: "DJE", name: "Djerba-Zarzis Airport", countryCode: "TN" },
    { code: "LAX", name: "Los Angeles International", countryCode: "US" },
    { code: "NBE", name: "Enfidha-Hammamet International Airport", countryCode: "TN" },
    { code: "IST", name: "Istanbul Airport", countryCode: "TR" },
    { code: "ORY", name: "Paris Orly Airport", countryCode: "FR" },
    { code: "CAI", name: "Cairo Airport", countryCode: "EG" },
    { code: "CMN", name: "Casablanca Mohammed V", countryCode: "MA" },
    { code: "ALG", name: "Algiers Houari Boumediene", countryCode: "DZ" },
    { code: "JFK", name: "John F. Kennedy International", countryCode: "US" },
    { code: "LHR", name: "London Heathrow", countryCode: "GB" },
    { code: "LGW", name: "London Gatwick", countryCode: "GB" },
    { code: "DXB", name: "Dubai International Airport", countryCode: "AE" },
    { code: "HND", name: "Tokyo Haneda", countryCode: "JP" },
    { code: "NRT", name: "Tokyo Narita", countryCode: "JP" },
    { code: "LAX", name: "Los Angeles International", countryCode: "US" },
    { code: "ORD", name: "Chicago O'Hare", countryCode: "US" },
    { code: "ATL", name: "Atlanta Hartsfield-Jackson", countryCode: "US" },
    { code: "AMS", name: "Amsterdam Schiphol", countryCode: "NL" },
    { code: "MAD", name: "Madrid Barajas", countryCode: "ES" },
    { code: "BCN", name: "Barcelona El Prat", countryCode: "ES" },
    { code: "FCO", name: "Rome Fiumicino", countryCode: "IT" },
    { code: "MXP", name: "Milan Malpensa", countryCode: "IT" },
    { code: "ZRH", name: "Zurich Airport", countryCode: "CH" },
    { code: "GVA", name: "Geneva Airport", countryCode: "CH" },
    { code: "VIE", name: "Vienna International", countryCode: "AT" },
    { code: "BRU", name: "Brussels Airport", countryCode: "BE" },
    { code: "CPT", name: "Cape Town International", countryCode: "ZA" },
    { code: "JNB", name: "Johannesburg OR Tambo", countryCode: "ZA" },
    { code: "BKK", name: "Bangkok Suvarnabhumi", countryCode: "TH" },
    { code: "SIN", name: "Singapore Changi", countryCode: "SG" },
    { code: "KUL", name: "Kuala Lumpur International", countryCode: "MY" },
    { code: "SYD", name: "Sydney Kingsford Smith", countryCode: "AU" },
    { code: "MEL", name: "Melbourne Airport", countryCode: "AU" },
    { code: "PEK", name: "Beijing Capital", countryCode: "CN" },
    { code: "PVG", name: "Shanghai Pudong", countryCode: "CN" },
    { code: "ICN", name: "Seoul Incheon", countryCode: "KR" },
    { code: "DEL", name: "Indira Gandhi Intl (Delhi)", countryCode: "IN" },
    { code: "BOM", name: "Chhatrapati Shivaji (Mumbai)", countryCode: "IN" },
    { code: "GRU", name: "São Paulo Guarulhos", countryCode: "BR" },
    { code: "EZE", name: "Buenos Aires Ezeiza", countryCode: "AR" },
    { code: "SCL", name: "Santiago Arturo Merino Benítez", countryCode: "CL" },
    { code: "MEX", name: "Mexico City Benito Juárez", countryCode: "MX" },
    { code: "YUL", name: "Montréal-Trudeau", countryCode: "CA" },
    { code: "YYZ", name: "Toronto Pearson", countryCode: "CA" },
    { code: "YVR", name: "Vancouver International", countryCode: "CA" },
    { code: "DOH", name: "Hamad International (Doha)", countryCode: "QA" },
    { code: "JED", name: "King Abdulaziz Intl (Jeddah)", countryCode: "SA" }
  ];
  
  
  
  const freightRatesPerKg = {
  BJ: 1.9,
  AZ: 2.3,
  AT: 2.0,
  A3: 2.4,
  TK: 2.8,
  AF: 2.5,
  MS: 2.2,
  AH: 2.1,
  QR: 3.0,
  LH: 2.6,
  TU: 1.5,
  EK: 2.7,
  UG: 1.6,
};

  

  
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUser(data);
    };
    fetchUser();
  }, []);

  const handleSearch = async () => {
    setMessage("");
    setResults([]);
    setLoading(true);
  
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  
    const allFlights = [];
  
    try {
      for (const currentDate of dates) {
        const response = await fetch("/api/amadeus/flights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: from, destination: to, date: currentDate }),
        });
  
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          allFlights.push(...data);
        }
      }
  
      if (allFlights.length === 0) {
  setToast({ show: true, message: "Aucun vol trouvé pour les 7 jours sélectionnés.", type: "error" });
  setLoading(false);
  return;
}

      const grouped = {};
      const tags = {};
      const datesSet = new Set(dates);
  
      allFlights.forEach((flight) => {
        const airline = flight.validatingAirlineCodes[0];
        const price = parseFloat(flight.price.total);
        const segments = flight.itineraries[0].segments;
      
        const validSegment = segments.find(
          seg => seg.departure.iataCode === from && seg.arrival.iataCode === to
        );
      
        if (!validSegment) return; // ignorer les vols qui ne correspondent pas
      
        const flightDate = validSegment.departure.at.split("T")[0];
        const flightNumber = validSegment.carrierCode + validSegment.number;
      
        if (!datesSet.has(flightDate)) return;
      
        if (!grouped[airline]) grouped[airline] = {};
        grouped[airline][flightDate] = {
          price,
          flightNumber,
          segments, 
        };
              });
      
  
      dates.forEach((date) => {
        let cheapestPrice = Infinity;
        let bestPrice = Infinity;
  
        Object.keys(grouped).forEach((airline) => {
          const flight = grouped[airline][date];
          if (flight) {
            if (flight.price < cheapestPrice) cheapestPrice = flight.price;
            bestPrice = Math.min(bestPrice, flight.price);
          }
        });
  
        Object.keys(grouped).forEach((airline) => {
          const flight = grouped[airline][date];
          if (flight) {
            if (!tags[date]) tags[date] = {};
            tags[date][airline] = [];
  
            if (flight.price === cheapestPrice) tags[date][airline].push("Cheap");
            if (flight.price <= bestPrice * 1.2) tags[date][airline].push("Best");
            if (Math.random() > 0.7) tags[date][airline].push("Green");
          }
        });
      });
  
      setResults({ grouped, tags, dates });
    } catch (err) {
  console.error(err);
  setToast({ show: true, message: "Erreur serveur", type: "error" });
}

  
    setLoading(false);
  };
  

  const filteredAirlines = Object.entries(results.grouped || {}).filter(([airline]) =>
    airlineNames[airline]?.toLowerCase().includes(searchAirline.toLowerCase()) ||
    airline.toLowerCase().includes(searchAirline.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarOpen} />
      <main className={`transition-all duration-300 flex-1 min-h-screen bg-[#3F6592] p-8 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white rounded-3xl p-10 shadow-lg relative">
        <div className="absolute top-14 right-8">

<div className="relative user-menu">
<button
className="flex items-center bg-[#3F6592] text-white py-1 px-4 rounded-full shadow-md"
onClick={() => setUserMenuOpen(!userMenuOpen)}
>
<FaUser className="mr-2" />
<span>{user ? `${user.firstname} ${user.lastname}` : "Utilisateur"}</span>
</button>

{userMenuOpen && (
<div className="absolute right-0 mt-2 w-48 bg-white text-[#3F6592] rounded-lg shadow-lg z-50">
<button
  onClick={() => {
    setUserMenuOpen(false);
    window.location.href = "/Transitaire/Profil"; 
  }}
  className="w-full text-left px-4 py-2 hover:bg-gray-100"
>
  Modifier profil
</button>
<button
  onClick={() => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }}
  className="w-full text-left px-4 py-2 hover:bg-gray-100"
>
  Se déconnecter
</button>
</div>
)}
</div>
</div>
<h2 className="text-2xl font-bold text-center text-[#3F6592]  mt-24 mb-10">🔍 Recherche de Vols </h2>
       
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-24">
        
          <div className="relative">
          <FaPlane className="absolute top-3 left-3 text-gray-400" />  
          <input type="text" placeholder="Rechercher compagnie..." 
          value={searchAirline} onChange={(e) => setSearchAirline(e.target.value)}
          className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"/>
          </div>
          


           {/* Champ FROM avec suggestions */}
           <div className="relative">
  <FaPlaneDeparture className="absolute top-3 left-3 text-gray-400" />
  <input
    type="text"
    placeholder="Aéroport de départ (ex: TUN)"
    value={from}
    onChange={(e) => {
      setFrom(e.target.value);
      setFromSuggestions(
        airports.filter(a =>
          a.code.toLowerCase().includes(e.target.value.toLowerCase()) ||
          a.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    }}
    className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"
  />
  {fromSuggestions.length > 0 && (
    <ul className="absolute z-50 bg-white border border-gray-300 rounded-lg mt-2 shadow-lg max-h-60 overflow-y-auto w-full animate-fade-in">
      {fromSuggestions.map((a, i) => (
        <li
          key={i}
          onClick={() => {
            setFrom(a.code);
            setFromSuggestions([]);
          }}
          className="px-4 py-2 hover:bg-[#3F6592] hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-3"
        >
          <img
            src={`https://flagcdn.com/32x24/${a.countryCode.toLowerCase()}.png`}
            alt={a.countryCode}
            className="w-6 h-4 object-contain rounded-sm shadow-sm border"
          />
          <div className="text-sm">
            <div className="font-semibold">{a.name}</div>
            <div className="text-xs text-gray-500">({a.code})</div>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>


{/* Champ TO avec suggestions */}
<div className="relative">
  <FaPlaneArrival className="absolute top-3 left-3 text-gray-400" />
  <input
    type="text"
    placeholder="Aéroport d’arrivée (ex: CDG)"
    value={to}
    onChange={(e) => {
      setTo(e.target.value);
      setToSuggestions(
        airports.filter(a =>
          a.code.toLowerCase().includes(e.target.value.toLowerCase()) ||
          a.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    }}
    className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"
  />
  {toSuggestions.length > 0 && (
    <ul className="absolute z-50 bg-white border border-gray-300 rounded-lg mt-2 shadow-lg max-h-60 overflow-y-auto w-full animate-fade-in">
      {toSuggestions.map((a, i) => (
        <li
          key={i}
          onClick={() => {
            setTo(a.code);
            setToSuggestions([]);
          }}
          className="px-4 py-2 hover:bg-[#3F6592] hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-3"
        >
          <img
            src={`https://flagcdn.com/32x24/${a.countryCode.toLowerCase()}.png`}
            alt={a.countryCode}
            className="w-6 h-4 object-contain rounded-sm shadow-sm border"
          />
          <div className="text-sm">
            <div className="font-semibold">{a.name}</div>
            <div className="text-xs text-gray-500">({a.code})</div>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>


            <div className="relative">
              <FaCalendarAlt className="absolute top-3 left-3 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 pl-10 border-2 border-[#3F6592] rounded-lg"
              />
            </div>
          </div>


          {/* Formulaire Marchandise */}
<div className="bg-gray-100 rounded-2xl p-6 mt-10 mb-10 shadow-md">
  <h3 className="text-lg font-bold text-[#3F6592] mb-4">📦 Détails de la Marchandise</h3>
  <div className="flex gap-3 mb-6">
  {["Standard", "Température contrôlée", "Cargo Aircraft"].map((mode) => (
    <button
      key={mode}
      onClick={() => setShipmentMode(mode)}
      className={`px-4 py-2 rounded-full border font-medium ${
        shipmentMode === mode ? "bg-[#3F6592] text-white" : "bg-white text-[#3F6592]"
      }`}
    >
      {mode}
    </button>
  ))}
</div>


  <div className="grid md:grid-cols-2 gap-4">
    <div>
      <label className="block mb-1 font-semibold">Nombre de pièces</label>
     <input
  type="number"
value={cargoData.pieces === "" ? "" : Number(cargoData.pieces)}
  onChange={(e) => {
    const value = e.target.value;

    // Autoriser champ vide temporairement
    if (value === "") {
      setCargoData({ ...cargoData, pieces: "" });
      return;
    }

    const count = parseInt(value);
    if (!isNaN(count) && count > 0) {
      setCargoData({
        ...cargoData,
        pieces: count,
        items: Array.from({ length: count }, (_, i) => cargoData.items[i] || {
          quantite: "",
          type: "Colis",
          longueur: "",
          largeur: "",
          hauteur: "",
          poids: "",
          hsCode: "",
          stackable: false,
          nature: "",
          dangerous: false,
          tempMin: "",
          tempMax: "",
          humidityRange: "",
          aircraftType: ""
        })
      });
    }
  }}
  className="w-full p-2 border rounded-lg"
  min="1"
/>

    </div>

   
  </div>

  {/* Dimensions */}
  <div className="mt-4 space-y-2">
  {cargoData.items.map((item, index) => (
  <div key={index} className="border p-4 rounded-lg bg-white shadow-sm mb-4">
    <h4 className="font-bold text-[#3F6592] mb-4">📦 Pièce {index + 1}</h4>

    <div className="grid md:grid-cols-6 gap-4">
      {/* Quantité */}
      <input
        type="number"
        placeholder="Quantité"
        value={item.quantite || ""}
        onChange={(e) => {
          const updated = [...cargoData.items];
          updated[index].quantite = e.target.value;
          setCargoData({ ...cargoData, items: updated });
        }}
        className="p-2 border rounded-lg col-span-1"
      />

      {/* Type Colis/Palette */}
      <div className="flex flex-col col-span-1">
        <label className="text-sm font-medium mb-1">Type</label>
        <div className="flex gap-2">
          <label className="flex items-center gap-1">
            <input type="radio" name={`type-${index}`} checked={item.type === "Colis"}
              onChange={() => {
                const updated = [...cargoData.items];
                updated[index].type = "Colis";
                setCargoData({ ...cargoData, items: updated });
              }} /> Colis
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name={`type-${index}`} checked={item.type === "Palette"}
              onChange={() => {
                const updated = [...cargoData.items];
                updated[index].type = "Palette";
                setCargoData({ ...cargoData, items: updated });
              }} /> Palette
          </label>
        </div>
      </div>
      <input
  type="text"
  placeholder="HS Code"
  value={item.hsCode || ""}
  onChange={(e) => {
    const updated = [...cargoData.items];
    updated[index].hsCode = e.target.value;
    setCargoData({ ...cargoData, items: updated });
  }}
  className="p-2 border rounded-lg col-span-1"
/>

      {/* Dimensions */}
      <input type="number" placeholder="Longueur" value={item.longueur || ""} onChange={(e) => {
        const updated = [...cargoData.items];
        updated[index].longueur = e.target.value;
        setCargoData({ ...cargoData, items: updated });
      }} className="p-2 border rounded-lg col-span-1" />

      <input type="number" placeholder="Largeur" value={item.largeur || ""} onChange={(e) => {
        const updated = [...cargoData.items];
        updated[index].largeur = e.target.value;
        setCargoData({ ...cargoData, items: updated });
      }} className="p-2 border rounded-lg col-span-1" />

      <input type="number" placeholder="Hauteur" value={item.hauteur || ""} onChange={(e) => {
        const updated = [...cargoData.items];
        updated[index].hauteur = e.target.value;
        setCargoData({ ...cargoData, items: updated });
      }} className="p-2 border rounded-lg col-span-1" />

      <input type="number" placeholder="Poids" value={item.poids || ""} onChange={(e) => {
        const updated = [...cargoData.items];
        updated[index].poids = e.target.value;
        setCargoData({ ...cargoData, items: updated });
      }} className="p-2 border rounded-lg col-span-1" />
    </div>

    <div className="grid md:grid-cols-3 gap-4 mt-4">
      {/* Gerbable */}
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name={`stackable-${index}`}
            checked={item.stackable === true}
            onChange={() => {
              const updated = [...cargoData.items];
              updated[index].stackable = true;
              setCargoData({ ...cargoData, items: updated });
            }}
          /> Gerbable
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name={`stackable-${index}`}
            checked={item.stackable === false}
            onChange={() => {
              const updated = [...cargoData.items];
              updated[index].stackable = false;
              setCargoData({ ...cargoData, items: updated });
            }}
          /> Non gerbable
        </label>
      </div>

      {/* Nature */}
      <div>
        <label className="block mb-1 font-medium">Nature de la marchandise</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={item.nature || ""}
          onChange={(e) => {
            const updated = [...cargoData.items];
            updated[index].nature = e.target.value;
            setCargoData({ ...cargoData, items: updated });
          }}
        >
          <option value="">Sélectionner</option>
          <option value="chimique">Chimique</option>
          <option value="organique">Organique</option>
          <option value="electronique">Électronique</option>
        </select>
      </div>

      {/* Dangerosité */}
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name={`danger-${index}`}
            checked={item.dangerous === true}
            onChange={() => {
              const updated = [...cargoData.items];
              updated[index].dangerous = true;
              setCargoData({ ...cargoData, items: updated });
            }}
          /> Dangereux
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name={`danger-${index}`}
            checked={item.dangerous === false}
            onChange={() => {
              const updated = [...cargoData.items];
              updated[index].dangerous = false;
              setCargoData({ ...cargoData, items: updated });
            }}
          /> Non dangereux
        </label>
      </div>
      
    </div>

    {/* Extra : Température (si Température contrôlée) */}
    {shipmentMode === "Température contrôlée" && (
  <div className="grid md:grid-cols-3 gap-4 mt-4 items-center">
    <div>
      <label className="block font-medium">Température min (°C)</label>
      <input
        type="range"
        min="-30"
        max="30"
        value={item.tempMin || 0}
        onChange={(e) => {
          const updated = [...cargoData.items];
          updated[index].tempMin = e.target.value;
          setCargoData({ ...cargoData, items: updated });
        }}
        className="w-full"
      />
      <div className="text-center font-semibold">{item.tempMin || 0}°C</div>
    </div>

    <div>
      <label className="block font-medium">Température max (°C)</label>
      <input
        type="range"
        min="-30"
        max="30"
        value={item.tempMax || 0}
        onChange={(e) => {
          const updated = [...cargoData.items];
          updated[index].tempMax = e.target.value;
          setCargoData({ ...cargoData, items: updated });
        }}
        className="w-full"
      />
      <div className="text-center font-semibold">{item.tempMax || 0}°C</div>
    </div>

    <div>
      <label className="block font-medium">Plage d’humidité</label>
      <select
        className="p-2 border rounded-lg w-full"
        value={item.humidityRange || ""}
        onChange={(e) => {
          const updated = [...cargoData.items];
          updated[index].humidityRange = e.target.value;
          setCargoData({ ...cargoData, items: updated });
        }}
      >
        <option value="">Choisir...</option>
        <option>-20° à -10°</option>
        <option>2° à 8°</option>
        <option>10° à 25°</option>
      </select>
    </div>
  </div>
)}


    {/* Extra : Avion (si Cargo Aircraft) */}
    {shipmentMode === "Cargo Aircraft" && (
      <div className="mt-4">
        <label className="block mb-1">Type d’avion requis</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={item.aircraftType || ""}
          onChange={(e) => {
            const updated = [...cargoData.items];
            updated[index].aircraftType = e.target.value;
            setCargoData({ ...cargoData, items: updated });
          }}
        >
          <option value="">Sélectionner un avion</option>
          <option>AIRBUS A300 B4F</option>
          <option>Boeing 747-8F</option>
          <option>Boeing 777F</option>
          <option>McDonnell Douglas MD-11F</option>
        </select>
      </div>
    )}
  </div>
))}
<div className="mt-8">
  <label className="block mb-2 font-semibold text-[#3F6592]">📝 Remarques / Détails supplémentaires</label>
  <textarea
    rows="3"
    className="w-full border p-3 rounded-lg"
    placeholder="Saisissez ici des détails supplémentaires sur l’envoi..."
    value={cargoData.notes || ""}
    onChange={(e) => setCargoData({ ...cargoData, notes: e.target.value })}
  ></textarea>
</div>

</div>



</div>

{loading && (
  <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col justify-center items-center">
    <img src="/preloader.gif" alt="Chargement..." className="w-54 h-44 mb-4" />
    <span className="text-[#3F6592] font-semibold text-lg">Chargement des vols...</span>
  </div>
)}

          <div className="flex justify-center">
          <button
  onClick={handleSearch}
  disabled={!from || !to || !date}
  className={`bg-[#0EC953] hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full ${
    !from || !to || !date ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  Rechercher
</button>

          </div>
       

          {message && <p className="text-red-500 mt-5">{message}</p>}
          {results?.grouped && (
  <div className="overflow-x-auto mt-10 rounded-lg shadow-md">
    <table className="min-w-full bg-white border-collapse text-sm rounded-lg overflow-hidden shadow-md">
      <thead className="bg-[#3F6592] text-white">
        <tr>
          <th className="py-3 px-4 text-left">✈️ Compagnie</th>
          {results.dates.map(date => (
            <th key={date} className="py-3 px-4 text-center">
              {new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredAirlines.map(([airline, flights], idx) => (
          <tr key={airline} className={`${idx % 2 === 0 ? "bg-gray-100" : "bg-white"} border-b`}>
            <td className="py-3 px-4 flex items-center gap-2">
              <img
                src={`https://images.kiwi.com/airlines/64/${airline}.png`}
                alt={airline}
                className="w-34 h-18 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-logo.png'; }}
              />
              <div>
                <div className="text-sm font-semibold">{airline}</div>
                <div className="text-xs text-gray-600">{airlineNames?.[airline] || ""}</div>
              </div>
            </td>
            {results.dates.map(date => {
              const flight = flights[date];
              const tagList = results.tags?.[date]?.[airline] || [];

              return (
                <td key={date} className="py-3 px-4 text-center">
                  {flight ? (
                    <div
  className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition"
  onClick={() =>
    setSelectedFlight({
      airline,
      flightNumber: flight.flightNumber,
      from,
      to,
      tarif: freightRatesPerKg[airline],
      segments: flight.segments,
      cargoData, 
      userId: user?._id, 
      totalWeight: poidsTotal,
      totalPrice: poidsTotal * freightRatesPerKg[airline]       
    })
  }
  
  >
                      <span className="font-semibold text-black text-sm mb-1">
  {freightRatesPerKg[airline]
    ? `${freightRatesPerKg[airline].toFixed(2)} €/kg`
    : "N/A"}
</span>

                      <div className="flex gap-1 flex-wrap justify-center">
                        {tagList.map(tag => (
                          <span
                            key={tag}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white
                              ${tag === "Cheap" ? "bg-purple-600" :
                                tag === "Best" ? "bg-blue-600" :
                                tag === "Green" ? "bg-green-600" : "bg-gray-500"
                              }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{flight.flightNumber}</div>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
    <FlightDetailsModal flight={selectedFlight} onClose={() => setSelectedFlight(null)}  setToast={setToast} />

  </div>
)}


        </div>



      </main>
      {toast.show && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast({ ...toast, show: false })}
  />
)}
    {/* ChatBot flottant */}
            <div
              style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 1000,
              }}
            >
              <ChatBot />
            </div>
    </div>
  );
}
