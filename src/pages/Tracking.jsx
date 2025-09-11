import { useState } from 'react'
import CarrierLinks from './CarrierLinks'
import OceanCarriers from './OceanCarriers'
import FreightForwarders from './FreightForwarders'

const Tracking = () => {
  const [activeTab, setActiveTab] = useState('airlines')

  const tabs = [
    { id: 'airlines', label: 'Airlines', icon: '✈️' },
    { id: 'ocean_carriers', label: 'Ocean Carriers', icon: '🚢' },
    { id: 'freight_forwarders', label: 'Freight Forwarders', icon: '📦' }
  ]

  const renderContent = () => {
    switch(activeTab) {
      case 'airlines':
        return <CarrierLinks />
      case 'ocean_carriers':
        return <OceanCarriers />
      case 'freight_forwarders':
        return <FreightForwarders />
      default:
        return <CarrierLinks />
    }
  }

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h1 className="tracking-title">Shipment Tracking</h1>
        <p className="tracking-description">
          Track your cargo shipments across airlines, ocean carriers, and freight forwarders worldwide
        </p>
      </div>

      <div className="tracking-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tracking-content">
        {renderContent()}
      </div>
    </div>
  )
}

export default Tracking