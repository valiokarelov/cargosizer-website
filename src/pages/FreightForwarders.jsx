import { useState } from 'react'
import { ExternalLink, Search } from 'lucide-react'
import freightForwardersData from '../data/freight-forwarders.json'

const FreightForwarders = () => {
  const [searchTerm, setSearchTerm] = useState('')

  // Convert object to array of values
  const freightForwardersArray = Object.values(freightForwardersData)

  // Filter forwarders based on search
  const filteredForwarders = freightForwardersArray.filter(forwarder =>
    forwarder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forwarder.regions.some(region => region.toLowerCase().includes(searchTerm.toLowerCase())) ||
    forwarder.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="carrier-links-container">
      <div className="carrier-links-header">
        <h1 className="carrier-links-title">Freight Forwarder Links</h1>
        <p className="carrier-links-description">
          Direct access to {freightForwardersArray.length} major freight forwarders worldwide. Click any forwarder to visit their tracking page.
        </p>
      </div>

      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by forwarder name, region, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="carrier-search-input"
          />
        </div>
        <div className="search-results-count">
          Showing {filteredForwarders.length} of {freightForwardersArray.length} freight forwarders
        </div>
      </div>

      <div className="airlines-grid-compact">
        {filteredForwarders.map(forwarder => (
          <a
            key={forwarder.id}
            href={forwarder.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="airline-card-compact"
          >
            <div className="airline-prefix-compact">{forwarder.name.substring(0, 3).toUpperCase()}</div>
            <div className="airline-name-compact">{forwarder.name}</div>
            <ExternalLink className="external-icon-compact" />
          </a>
        ))}
      </div>

      <div className="carrier-links-footer">
        <div className="footer-info">
          <h3>How to Use</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Reference Numbers:</strong> Use your booking or reference number provided by the forwarder
            </div>
            <div className="info-item">
              <strong>House AWB/B/L:</strong> House airway bills or bills of lading can be tracked
            </div>
            <div className="info-item">
              <strong>Direct Links:</strong> Click any forwarder card to open their tracking website in a new tab
            </div>
            <div className="info-item">
              <strong>Search:</strong> Filter forwarders by name, region, or service type for quick access
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreightForwarders