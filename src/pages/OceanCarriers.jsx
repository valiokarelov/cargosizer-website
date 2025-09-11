import { useState } from 'react'
import { ExternalLink, Search } from 'lucide-react'
import oceanCarriersData from '../data/ocean-carriers.json'

const OceanCarriers = () => {
  const [searchTerm, setSearchTerm] = useState('')

  // Convert object to array of values
  const oceanCarriersArray = Object.values(oceanCarriersData)

  // Filter carriers based on search
  const filteredCarriers = oceanCarriersArray.filter(carrier =>
    carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carrier.regions.some(region => region.toLowerCase().includes(searchTerm.toLowerCase())) ||
    carrier.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="carrier-links-container">
      <div className="carrier-links-header">
        <h1 className="carrier-links-title">Ocean Carrier Links</h1>
        <p className="carrier-links-description">
          Direct access to {oceanCarriersArray.length} major ocean carriers worldwide. Click any carrier to visit their tracking page.
        </p>
      </div>

      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by carrier name, region, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="carrier-search-input"
          />
        </div>
        <div className="search-results-count">
          Showing {filteredCarriers.length} of {oceanCarriersArray.length} ocean carriers
        </div>
      </div>

      <div className="airlines-grid-compact">
        {filteredCarriers.map(carrier => (
          <a
            key={carrier.id}
            href={carrier.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="airline-card-compact"
          >
            <div className="airline-prefix-compact">{carrier.name.substring(0, 3).toUpperCase()}</div>
            <div className="airline-name-compact">{carrier.name}</div>
            <ExternalLink className="external-icon-compact" />
          </a>
        ))}
      </div>

      <div className="carrier-links-footer">
        <div className="footer-info">
          <h3>How to Use</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Container Numbers:</strong> Use your container number format (e.g., MSCU1234567)
            </div>
            <div className="info-item">
              <strong>Bill of Lading:</strong> B/L numbers can also be used for tracking
            </div>
            <div className="info-item">
              <strong>Direct Links:</strong> Click any carrier card to open their tracking website in a new tab
            </div>
            <div className="info-item">
              <strong>Search:</strong> Filter carriers by name, region, or service type for quick access
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OceanCarriers