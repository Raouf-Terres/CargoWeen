'use client';
import { useRouter } from 'next/navigation';

const CompanyList = ({ companies = [], onSelectCompany, selectedCompany, deliveryAddress }) => {
  const router = useRouter();

  if (!companies || companies.length === 0) {
    return (
      <div className="company-list">
        <h3>Sociétés Recommandées</h3>
        <p>Aucune société recommandée disponible</p>
      </div>
    );
  }

  const handleReserveClick = (company, e) => {
    e.stopPropagation();
    if (!company?.id) {
      console.error("ID de société manquant");
      return;
    }
    
    const companyData = {
      id: company.id,
      DistanceToAirport: company.DistanceToAirport,
      DeliveryDistance: company.DeliveryDistance,
      TarifTotal: company.TarifTotal,
      deliveryAddress: deliveryAddress, // Ajout de l'adresse
      pdfFile: company.pdfFile // Ajout du PDF si disponible
    };
    
    router.push(`/reservation/${company.id}?data=${encodeURIComponent(JSON.stringify(companyData))}`);
  };

  return (
    <div className="company-list">
      <h3>Sociétés Recommandées</h3>
      
      <ul>
        {companies.map((company, index) => (
          <li 
            key={index} 
            className={`company-item ${selectedCompany === company ? 'selected' : ''}`}
            onClick={() => onSelectCompany(company)}
          >
            <div className="company-header">
              <h4>{company.CompanyName}</h4>
              <span className="rank">#{index + 1}</span>
            </div>
            <p className="address">{company.PostalAddress}</p>
            <div className="details">
              <div>
                <span>Distance:</span>
                <span>{company.DistanceToAirport.toFixed(2)} km</span>
              </div>
              <div>
                <span>Tarif:</span>
                <span>{company.TarifTotal.toFixed(2)} €</span>
              </div>
              <button 
                className="reserve-button"
                onClick={(e) => handleReserveClick(company, e)}
              >
                Réserver
              </button>
            </div>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .company-list {
          flex: 1;
          max-width: 500px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          overflow-y: auto;
          max-height: 600px;
        }
        h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .company-item {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 6px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .company-item:hover {
          border-color: #3F6592;
          background-color: #f7faff;
        }
        .company-item.selected {
          border-color: #3F6592;
          background-color: #e6f0ff;
        }
        .company-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        h4 {
          margin: 0;
          color: #3F6592;
        }
        .rank {
          background: #3F6592;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
        }
        .address {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 0.9em;
        }
        .details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          font-size: 0.9em;
        }
        .details div {
          display: flex;
          flex-direction: column;
        }
        .details span:first-child {
          color: #888;
          font-size: 0.8em;
        }
        .reserve-button {
          background-color: #3F6592;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.9em;
          transition: background-color 0.2s;
          align-self: end;
        }
        .reserve-button:hover {
          background-color: #3F6592;
        }
      `}</style>
    </div>
  );
}

export default CompanyList;