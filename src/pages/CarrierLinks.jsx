import { useState } from 'react'
import { ExternalLink, Search } from 'lucide-react'
import airlinesData from '../data/airlines.json'

const CarrierLinks = () => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter airlines based on search
  const filteredAirlines = airlinesData.filter(airline =>
    airline.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Extract AWB prefix from airline name
  const getAWBPrefix = (name) => {
    const match = name.match(/^(\d{3})/)
    return match ? match[1] : ''
  }

  // Extract clean airline name
  const getCleanName = (name) => {
    return name.replace(/^\d{3}\s+[A-Z0-9]{1,3}\s+/, '')
  }

  return (
    <div className="carrier-links-container">
      <div className="carrier-links-header">
        <h1 className="carrier-links-title">Airline Carrier Links</h1>
        <p className="carrier-links-description">
          Direct access to {airlinesData.length} airline cargo tracking websites. Click any airline to visit their tracking page.
        </p>
      </div>

      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by airline name, code, or AWB prefix..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="carrier-search-input"
          />
        </div>
        
        <div className="search-results-count">
          Showing {filteredAirlines.length} of {airlinesData.length} airlines
        </div>
      </div>

      <div className="airlines-grid-compact">
        {filteredAirlines.map(airline => (
          <a
            key={airline.id}
            href={airline.url}
            target="_blank"
            rel="noopener noreferrer"
            className="airline-card-compact"
          >
            <div className="airline-prefix-compact">{getAWBPrefix(airline.name)}</div>
            <div className="airline-name-compact">{getCleanName(airline.name)}</div>
            <ExternalLink className="external-icon-compact" />
          </a>
        ))}
      </div>

      <div className="carrier-links-footer">
        <div className="footer-info">
          <h3>How to Use</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>AWB Prefix:</strong> Three-digit code identifying the airline (e.g., 020 for Lufthansa)
            </div>
            <div className="info-item">
              <strong>Airline Code:</strong> IATA two-letter code for the airline (e.g., LH for Lufthansa)
            </div>
            <div className="info-item">
              <strong>Direct Links:</strong> Click any airline card to open their tracking website in a new tab
            </div>
            <div className="info-item">
              <strong>Search:</strong> Filter airlines by name, code, or AWB prefix for quick access
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarrierLinks