import { useState } from 'react'
import { Search, Package, Ship, Plane, Container, Copy, Check, Calculator, BarChart3, X } from 'lucide-react'
import containersData from '../data/containers.json'

const Equipment = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [copiedSpecs, setCopiedSpecs] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  const categories = [
    { id: 'all', name: 'All Equipment', icon: Package },
    { id: 'ocean', name: 'Ocean Containers', icon: Container },
    { id: 'truck', name: 'Truck Trailers', icon: Ship },
    { id: 'active-temp', name: 'Active Temperature', icon: Package },
    { id: 'passive-temp', name: 'Passive Temperature', icon: Package }
  ]

  // Convert your JSON data to equipment format
  const convertContainerData = (container) => {
    const formatDimensions = (dims) => {
      return `${(dims.length/100).toFixed(1)}m × ${(dims.width/100).toFixed(1)}m × ${(dims.height/100).toFixed(1)}m`
    }

    return {
      id: container.id,
      name: container.name,
      fullName: container.name,
      type: container.category,
      specs: {
        dimensions: formatDimensions(container.dimensions),
        volume: `${container.volume} m³`,
        maxWeight: `${container.maxWeight.toLocaleString()} kg`,
        tempRange: container.tempRange,
        ...(container.powerRequired && { powerRequired: 'Yes' }),
        ...(container.maxTransitHours && { maxTransit: `${container.maxTransitHours}h` }),
        ...(container.specialFeatures.length > 0 && { features: container.specialFeatures.join(', ') })
      },
      description: container.description,
      category: container.category,
      copyText: `Equipment: ${container.name}
Dimensions: ${formatDimensions(container.dimensions)}
Volume: ${container.volume} m³
Max Weight: ${container.maxWeight.toLocaleString()} kg
Temperature: ${container.tempRange}
${container.powerRequired ? 'Power Required: Yes' : ''}
${container.specialFeatures.length > 0 ? `Features: ${container.specialFeatures.join(', ')}` : ''}
Description: ${container.description}`
    }
  }

  // Process containers by category
  const getCategoryEquipment = (categoryId) => {
    const containers = Object.values(containersData).map(convertContainerData)
    
    switch (categoryId) {
      case 'ocean':
        return containers.filter(c => c.category === 'Ocean Containers')
      case 'truck':
        return containers.filter(c => c.category === 'Truck Trailers')
      case 'active-temp':
        return containers.filter(c => c.category === 'Active Temperature')
      case 'passive-temp':
        return containers.filter(c => c.category === 'Passive Temperature')
      default:
        return containers
    }
  }

  const getFilteredEquipment = () => {
    let items = getCategoryEquipment(selectedCategory)

    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return items
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSpecs(id)
      setTimeout(() => setCopiedSpecs(''), 2000)
    } catch {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopiedSpecs(id)
        setTimeout(() => setCopiedSpecs(''), 2000)
      } catch {
        alert(`Copy this text:\n\n${text}`)
      }
    }
  }

  const getIconForCategory = (category) => {
    if (category.includes('Ocean')) return Container
    if (category.includes('Truck')) return Ship
    if (category.includes('Temperature')) return Package
    return Package
  }

  const getColorForCategory = (category) => {
    if (category.includes('Ocean')) return '#2563eb'
    if (category.includes('Truck')) return '#059669'
    if (category.includes('Active')) return '#dc2626'
    if (category.includes('Passive')) return '#7c3aed'
    return '#6b7280'
  }

  const filteredEquipment = getFilteredEquipment()

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Equipment & Container Guide</h1>
          <p className="page-description">
            Quick reference for container dimensions, capacity, and cargo specifications
          </p>
        </div>

        <div className="tracking-section">
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '20px', height: '20px' }} />
            <input
              type="text"
              placeholder="Search equipment by name, type, or specifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="carrier-search-input"
              style={{ paddingLeft: '44px' }}
            />
          </div>

          <div className="tabs-container">
            <div className="tabs">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`tab ${selectedCategory === category.id ? 'tab-active' : ''}`}
                >
                  <category.icon className="tab-icon" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tracking-section">
          <h2 className="section-title">Quick Reference</h2>
          <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>Equipment</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>Volume</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>Max Weight</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #e5e7eb' }}>Temperature</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(containersData).slice(0, 6).map((container) => (
                  <tr key={container.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 12px', fontWeight: '500', border: '1px solid #e5e7eb' }}>{container.name}</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb' }}>{container.category}</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb' }}>{container.volume} m³</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb' }}>{container.maxWeight.toLocaleString()} kg</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb' }}>{container.tempRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tracking-section">
          <h2 className="section-title">Equipment Specifications</h2>
          {filteredEquipment.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: '0.5' }} />
              <p>No equipment found matching your search criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredEquipment.map((item) => {
                const IconComponent = getIconForCategory(item.category)
                const iconColor = getColorForCategory(item.category)
                
                return (
                  <div 
                    key={item.id} 
                    className="tool-card"
                    onClick={() => setSelectedEquipment(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="tool-icon">
                      <IconComponent className="icon" style={{ color: iconColor }} />
                    </div>
                    <h3 className="tool-name">{item.name}</h3>
                    <p className="tool-description">{item.description}</p>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      {item.category} • Click for specifications
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedEquipment && (
            <>
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
                onClick={() => setSelectedEquipment(null)}
              >
                <div 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    position: 'relative',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedEquipment(null)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    <X size={18} />
                  </button>

                  <div style={{ marginBottom: '24px', paddingRight: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ 
                        background: getColorForCategory(selectedEquipment.category) + '20',
                        padding: '8px',
                        borderRadius: '8px'
                      }}>
                        {(() => {
                          const IconComponent = getIconForCategory(selectedEquipment.category)
                          return <IconComponent size={24} style={{ color: getColorForCategory(selectedEquipment.category) }} />
                        })()}
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151', margin: 0 }}>
                          {selectedEquipment.name}
                        </h2>
                        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                          {selectedEquipment.category}
                        </p>
                      </div>
                    </div>
                    <p style={{ color: '#6b7280', margin: 0 }}>{selectedEquipment.description}</p>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                      Specifications
                    </h3>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                      {Object.entries(selectedEquipment.specs).map(([key, value], index) => (
                        <div 
                          key={key} 
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                            borderBottom: index < Object.entries(selectedEquipment.specs).length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}
                        >
                          <span style={{ color: '#6b7280', fontWeight: '500', textTransform: 'capitalize' }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span style={{ color: '#374151', fontWeight: '600', fontFamily: 'monospace' }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(selectedEquipment.copyText, selectedEquipment.id)}
                    className="btn-primary"
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {copiedSpecs === selectedEquipment.id ? (
                      <>
                        <Check size={16} />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Specifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="tracking-section">
          <h2 className="section-title">Calculate with Your Cargo</h2>
          <div className="tools-grid">
            <a href="/calculators" className="tool-card">
              <div className="tool-icon">
                <Calculator className="icon" />
              </div>
              <h3 className="tool-name">Weight Calculator</h3>
              <p className="tool-description">Calculate chargeable weight for air & ocean freight</p>
            </a>
            <a href="/tracking" className="tool-card">
              <div className="tool-icon">
                <BarChart3 className="icon" />
              </div>
              <h3 className="tool-name">Track Shipments</h3>
              <p className="tool-description">Direct access to 240+ carrier tracking systems</p>
            </a>
            <a href="/carriers" className="tool-card">
              <div className="tool-icon">
                <Ship className="icon" />
              </div>
              <h3 className="tool-name">Carrier Directory</h3>
              <p className="tool-description">Complete list of airline and shipping line tracking links</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Equipment