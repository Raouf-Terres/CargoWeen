//src/components/addressinput.js
const AddressInput = ({ onAddressChange }) => {
    return (
      <div className="address-input">
        <textarea
          id="delivery-address"
          rows={3}
          placeholder="Entrez l'adresse complète de livraison"
          onChange={(e) => onAddressChange(e.target.value)}
          required
        />
        <style jsx>{`
  .address-input {
    width: 100%;
    height: 100%;
  }
  textarea {
    width: 100%;
    height: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    resize: none;
    background-color: #f9fafb;
  }
  textarea:focus {
    outline: 2px solid #3b82f6;
    outline-offset: -1px;
  }
`}</style>
      </div>
    )
  }
  
  export default AddressInput