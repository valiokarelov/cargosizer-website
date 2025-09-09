import { useState } from 'react'
import carriersData from '../data/carriers.json'

const Tracking = () => {
  const [trackingType, setTrackingType] = useState('airlines')
  const [selectedCarrier, setSelectedCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Get carriers by type
  const getCarriersByType = (type) => {
    return Object.values(carriersData[type] || {})
  }

  // Filter carriers based on search term
  const getFilteredCarriers = (type) => {
    const carriers = getCarriersByType(type)
    if (!searchTerm) return carriers
    
    return carriers.filter(carrier => 
      carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  // Enhanced tracking handler that works with or without carrier selection
  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number')
      return
    }

    if (selectedCarrier) {
      // If carrier is selected, use specific carrier URL
      const allCarriers = {
        ...carriersData.airlines,
        ...carriersData.ocean_carriers,
        ...carriersData.freight_forwarders
      }
      const carrier = allCarriers[selectedCarrier]
      if (carrier) {
        window.open(carrier.trackingUrl, '_blank')
      }
    } else {
      // If no carrier selected, try to auto-detect from AWB prefix or suggest carrier selection
      const awbPrefix = trackingNumber.substring(0, 3)
      
      // Try to find carrier by AWB prefix
      const allCarriers = {
        ...carriersData.airlines,
        ...carriersData.ocean_carriers,
        ...carriersData.freight_forwarders
      }
      
      const foundCarrier = Object.values(allCarriers).find(carrier => 
        carrier.awbPrefix === awbPrefix
      )
      
      if (foundCarrier) {
        // Auto-detected carrier, open tracking
        window.open(foundCarrier.trackingUrl, '_blank')
      } else {
        // Suggest selecting a carrier
        alert('Could not auto-detect carrier. Please select a carrier below or search for your specific carrier.')
      }
    }
  }

  // Get tracking method label
  const getTrackingMethodLabel = (carrierId) => {
    const allCarriers = {
      ...carriersData.airlines,
      ...carriersData.ocean_carriers,
      ...carriersData.freight_forwarders
    }
    
    const carrier = allCarriers[carrierId]
    if (!carrier) return 'Tracking Number'
    
    switch (carrier.trackingMethod) {
      case 'awb': return 'Air Waybill (AWB)'
      case 'container_number': return 'Container Number'
      case 'tracking_number': return 'Tracking Number'
      case 'reference_number': return 'Reference Number'
      default: return 'Tracking Number'
    }
  }

  // Get AWB prefix for airlines
  const getAWBPrefix = (carrierId) => {
    const allCarriers = {
      ...carriersData.airlines,
      ...carriersData.ocean_carriers,
      ...carriersData.freight_forwarders
    }
    
    const carrier = allCarriers[carrierId]
    return carrier?.awbPrefix || null
  }

  const trackingTypes = [
    { value: 'airlines', label: 'Airlines', icon: '✈️' },
    { value: 'ocean_carriers', label: 'Ocean Carriers', icon: '🚢' },
    { value: 'freight_forwarders', label: 'Freight Forwarders', icon: '📦' }
  ]

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h1 className="tracking-title">Shipment Tracking</h1>
        <p className="tracking-description">
          Track your cargo shipments across major airlines, ocean carriers, and freight forwarders
        </p>
      </div>

      <div className="tracking-content">
        {/* Tracking Type Selection */}
        <div className="tracking-section">
          <h3 className="section-title">Select Service Type</h3>
          <div className="tracking-type-buttons">
            {trackingTypes.map(type => (
              <button
                key={type.value}
                onClick={() => {
                  setTrackingType(type.value)
                  setSelectedCarrier('')
                  setTrackingNumber('')
                }}
                className={`tracking-type-btn ${trackingType === type.value ? 'active' : ''}`}
              >
                <span className="type-icon">{type.icon}</span>
                <span className="type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Carrier Search */}
        <div className="tracking-section">
          <h3 className="section-title">Search Carriers</h3>
          <input
            type="text"
            placeholder="Search by carrier name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* MOVED: Tracking Number Input - Now appears between search and carrier selection */}
        <div className="tracking-section">
          <h3 className="section-title">Enter Tracking Information</h3>
          <div className="tracking-input-section">
            <label className="tracking-label">
              {selectedCarrier ? getTrackingMethodLabel(selectedCarrier) : 'Tracking Number / AWB'}
              {selectedCarrier && getAWBPrefix(selectedCarrier) && (
                <span className="awb-hint">
                  (Format: {getAWBPrefix(selectedCarrier)}-XXXXXXXX)
                </span>
              )}
            </label>
            <div className="tracking-input-group">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={
                  selectedCarrier && getAWBPrefix(selectedCarrier) 
                    ? `${getAWBPrefix(selectedCarrier)}-12345678`
                    : 'Enter tracking number (e.g., 003-12345678)'
                }
                className="tracking-number-input"
              />
              <button
                onClick={handleTrack}
                className="track-button"
                disabled={!trackingNumber.trim()}
              >
                Track Shipment
              </button>
            </div>
            
            <div className="tracking-help">
              {selectedCarrier ? (
                <>
                  <p>Click "Track Shipment" to open the carrier's tracking page in a new tab.</p>
                  <p className="carrier-tracking-info">
                    Tracking will open: {carriersData.airlines?.[selectedCarrier]?.trackingUrl || 
                                       carriersData.ocean_carriers?.[selectedCarrier]?.trackingUrl ||
                                       carriersData.freight_forwarders?.[selectedCarrier]?.trackingUrl}
                  </p>
                </>
              ) : (
                <>
                  <p>Enter your tracking number above and we'll try to auto-detect the carrier, or select a specific carrier below.</p>
                  <p>For airlines, use AWB format (e.g., 003-12345678). For ocean carriers, use container number (e.g., MSCU1234567).</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Carrier Selection - Now appears after tracking input */}
        <div className="tracking-section">
          <h3 className="section-title">Or Select Specific Carrier</h3>
          <div className="carriers-grid">
            {getFilteredCarriers(trackingType).map(carrier => (
              <div
                key={carrier.id}
                onClick={() => setSelectedCarrier(carrier.id)}
                className={`carrier-card ${selectedCarrier === carrier.id ? 'selected' : ''}`}
              >
                <div className="carrier-header">
                  <div className="carrier-logo">
                    {carrier.logo ? (
                      <img src={carrier.logo} alt={carrier.name} />
                    ) : (
                      <div className="carrier-initial">
                        {carrier.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="carrier-info">
                    <h4 className="carrier-name">{carrier.name}</h4>
                    <p className="carrier-type">{carrier.type}</p>
                  </div>
                </div>
                
                <div className="carrier-details">
                  <div className="carrier-regions">
                    <strong>Regions:</strong>
                    <div className="regions-list">
                      {carrier.regions.map(region => (
                        <span key={region} className="region-tag">{region}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="carrier-specialties">
                    <strong>Specialties:</strong>
                    <div className="specialties-list">
                      {carrier.specialties.map(specialty => (
                        <span key={specialty} className="specialty-tag">{specialty}</span>
                      ))}
                    </div>
                  </div>

                  {carrier.awbPrefix && (
                    <div className="awb-prefix">
                      <strong>AWB Prefix:</strong> {carrier.awbPrefix}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="tracking-section">
          <h3 className="section-title">Quick Access</h3>
          <div className="quick-access-grid">
            <div className="quick-access-category">
              <h4>Popular Airlines</h4>
              <div className="quick-links">
                {['delta-cargo', 'lufthansa-cargo', 'emirates-skycargo'].map(carrierId => {
                  const carrier = carriersData.airlines[carrierId]
                  return carrier ? (
                    <button
                      key={carrierId}
                      onClick={() => {
                        setTrackingType('airlines')
                        setSelectedCarrier(carrierId)
                      }}
                      className="quick-link-btn"
                    >
                      {carrier.name}
                    </button>
                  ) : null
                })}
              </div>
            </div>

            <div className="quick-access-category">
              <h4>Major Ocean Carriers</h4>
              <div className="quick-links">
                {['maersk', 'msc', 'cma-cgm'].map(carrierId => {
                  const carrier = carriersData.ocean_carriers[carrierId]
                  return carrier ? (
                    <button
                      key={carrierId}
                      onClick={() => {
                        setTrackingType('ocean_carriers')
                        setSelectedCarrier(carrierId)
                      }}
                      className="quick-link-btn"
                    >
                      {carrier.name}
                    </button>
                  ) : null
                })}
              </div>
            </div>

            <div className="quick-access-category">
              <h4>Express Services</h4>
              <div className="quick-links">
                {['fedex', 'ups', 'dhl'].map(carrierId => {
                  const carrier = carriersData.airlines[carrierId]
                  return carrier ? (
                    <button
                      key={carrierId}
                      onClick={() => {
                        setTrackingType('airlines')
                        setSelectedCarrier(carrierId)
                      }}
                      className="quick-link-btn"
                    >
                      {carrier.name}
                    </button>
                  ) : null
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tracking