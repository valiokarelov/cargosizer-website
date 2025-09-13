import React, { useState } from 'react'
import { Package, Truck, Plane, Thermometer, Snowflake, Search, Copy, CheckCircle, X } from 'lucide-react'

// Import your JSON data
import containersData from '../data/containers.json'
import trailersData from '../data/trailers.json'
import pharmaData from '../data/pharma-units.json'
import uldsData from '../data/ulds.json'

const Equipment = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [copiedSpecs, setCopiedSpecs] = useState(null)
  const [units, setUnits] = useState('cm') // 'cm' or 'in'

  const categories = [
    { id: 'all', name: 'All Equipment', icon: Package },
    { id: 'containers', name: 'Ocean Containers', icon: Package },
    { id: 'trailers', name: 'Truck Trailers', icon: Truck },
    { id: 'ulds', name: 'Air Cargo ULDs', icon: Plane },
    { id: 'pharma-active', name: 'Active Temperature', icon: Thermometer },
    { id: 'pharma-passive', name: 'Passive Temperature', icon: Snowflake }
  ]

  // Unit conversion functions
  const cmToInches = (cm) => (cm / 2.54).toFixed(1)
  
  const formatDimensions = (dimensions, unit = units) => {
    if (!dimensions) return 'N/A'
    
    if (unit === 'in') {
      return `${cmToInches(dimensions.length)}" × ${cmToInches(dimensions.width)}" × ${cmToInches(dimensions.height)}"`
    }
    return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} cm`
  }

  // Enhanced data conversion function
  const convertEquipmentData = (item, type, category) => {
    const baseData = {
      id: `${type}-${item.name?.replace(/\s+/g, '-').toLowerCase()}`,
      name: item.name,
      description: item.description || "Professional logistics equipment",
      category: category,
      originalType: type
    }

    // Handle different JSON structures
    if (item.dimensions) {
      // Standard structure (containers, trailers, ulds)
      const specs = {
        'Internal Dimensions (cm)': formatDimensions(item.dimensions, 'cm'),
        'Internal Dimensions (in)': formatDimensions(item.dimensions, 'in'),
        'Volume': item.volume ? `${item.volume} CBM` : 'N/A',
        'Max Weight': item.maxWeight ? `${item.maxWeight} kg` : 'N/A',
        'Temperature Range': item.tempRange || 'Ambient',
        'Power Required': item.powerRequired ? 'Yes' : 'No',
        'Temperature Controlled': item.temperatureControlled ? 'Yes' : 'No'
      }

      if (item.maxTransitHours) specs['Max Transit Time'] = `${item.maxTransitHours} hours`
      if (item.specialFeatures) specs['Special Features'] = item.specialFeatures.join(', ')

      return {
        ...baseData,
        specs,
        dimensions: item.dimensions,
        volume: item.volume,
        maxWeight: item.maxWeight,
        tempRange: item.tempRange,
        powerRequired: item.powerRequired || false,
        temperatureControlled: item.temperatureControlled || false,
        copyText: `Equipment: ${item.name}
Internal Dimensions: ${formatDimensions(item.dimensions, 'cm')} / ${formatDimensions(item.dimensions, 'in')}
Volume: ${item.volume || 'N/A'} CBM
Max Weight: ${item.maxWeight || 'N/A'} kg
Temperature: ${item.tempRange || 'Ambient'}`
      }
    } else if (item.internal) {
      // Pharma units structure with internal/external dimensions
      const specs = {
        'Internal Dimensions (cm)': formatDimensions(item.internal, 'cm'),
        'Internal Dimensions (in)': formatDimensions(item.internal, 'in'),
        'Volume': item.volume ? `${item.volume} CBM` : 'N/A',
        'Max Weight': item.maxWeight ? `${item.maxWeight} kg` : 'N/A',
        'Temperature Range': item.tempRange || 'N/A',
        'Power Required': item.powerRequired ? 'Yes' : 'No',
        'Temperature Controlled': item.temperatureControlled ? 'Yes' : 'No'
      }

      if (item.external) {
        specs['External Dimensions (cm)'] = formatDimensions(item.external, 'cm')
        specs['External Dimensions (in)'] = formatDimensions(item.external, 'in')
      }
      if (item.maxTransitHours) specs['Max Transit Time'] = `${item.maxTransitHours} hours`
      if (item.specialFeatures) specs['Special Features'] = item.specialFeatures.join(', ')
      if (item.weightLimit) specs['Weight Limit'] = `${item.weightLimit} kg`
      if (item.volumeLimit) specs['Volume Limit'] = `${item.volumeLimit} CBM`

      return {
        ...baseData,
        specs,
        dimensions: item.internal,
        externalDimensions: item.external,
        volume: item.volume,
        maxWeight: item.maxWeight,
        tempRange: item.tempRange,
        powerRequired: item.powerRequired || false,
        temperatureControlled: item.temperatureControlled || false,
        copyText: `Equipment: ${item.name}
Internal Dimensions: ${formatDimensions(item.internal, 'cm')} / ${formatDimensions(item.internal, 'in')}
${item.external ? `External Dimensions: ${formatDimensions(item.external, 'cm')} / ${formatDimensions(item.external, 'in')}` : ''}
Volume: ${item.volume || 'N/A'} CBM
Max Weight: ${item.maxWeight || 'N/A'} kg
Temperature: ${item.tempRange || 'N/A'}
Power Required: ${item.powerRequired ? 'Yes' : 'No'}`
      }
    }

    return baseData
  }

  // Combine all equipment data with enhanced processing
  const getAllEquipment = () => {
    const equipment = []

    // Ocean Containers
    Object.values(containersData).forEach(container => {
      equipment.push(convertEquipmentData(container, 'container', 'Ocean Container'))
    })

    // Truck Trailers
    Object.values(trailersData).forEach(trailer => {
      equipment.push(convertEquipmentData(trailer, 'trailer', 'Truck Trailer'))
    })

    // Air Cargo ULDs
    Object.values(uldsData).forEach(uld => {
      equipment.push(convertEquipmentData(uld, 'uld', 'Air Cargo ULD'))
    })

    // Active Pharma Units
    if (pharmaData.active) {
      pharmaData.active.forEach(unit => {
        equipment.push(convertEquipmentData(unit, 'pharma-active', 'Active Temperature'))
      })
    }

    // Passive Pharma Units
    if (pharmaData.passive) {
      pharmaData.passive.forEach(unit => {
        equipment.push(convertEquipmentData(unit, 'pharma-passive', 'Passive Temperature'))
      })
    }

    return equipment
  }

  const allEquipment = getAllEquipment()

  const getCategoryEquipment = (categoryId) => {
    switch (categoryId) {
      case 'containers':
        return allEquipment.filter(e => e.originalType === 'container')
      case 'trailers':
        return allEquipment.filter(e => e.originalType === 'trailer')
      case 'ulds':
        return allEquipment.filter(e => e.originalType === 'uld')
      case 'pharma-active':
        return allEquipment.filter(e => e.originalType === 'pharma-active')
      case 'pharma-passive':
        return allEquipment.filter(e => e.originalType === 'pharma-passive')
      default:
        return allEquipment
    }
  }

  const getFilteredEquipment = () => {
    let items = getCategoryEquipment(selectedCategory)
    
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(item.specs || {}).some(spec => 
          spec.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    
    return items
  }

  const filteredEquipment = getFilteredEquipment()

  const getIconForCategory = (type) => {
    switch (type) {
      case 'container': return Package
      case 'trailer': return Truck
      case 'uld': return Plane
      case 'pharma-active': return Thermometer
      case 'pharma-passive': return Snowflake
      default: return Package
    }
  }

  const getColorForCategory = (type) => {
    switch (type) {
      case 'container': return '#3b82f6'
      case 'trailer': return '#10b981'
      case 'uld': return '#f59e0b'
      case 'pharma-active': return '#ef4444'
      case 'pharma-passive': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSpecs(id)
      setTimeout(() => setCopiedSpecs(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="equipment-container">
      <div className="equipment-section">
        <div className="equipment-header">
          <h1 className="page-title">Equipment & Container Guide</h1>
          <p className="text-gray-600">
            Comprehensive specifications for logistics equipment, containers, and temperature-controlled units
          </p>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search equipment by name, type, or specifications..."
              className="search-input"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="categories-section">
          <div className="categories-grid">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                >
                  <IconComponent size={20} />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>



        {/* Equipment Cards */}
        <div className="cards-section">
          <div className="section-header">
            <h3 className="section-title">
              Equipment Specifications
              <span className="item-count">({filteredEquipment.length} items)</span>
            </h3>
          </div>
          
          {filteredEquipment.length === 0 ? (
            <div className="no-results">
              <p>No equipment found matching your search criteria.</p>
            </div>
          ) : (
            <div className="equipment-grid">
              {filteredEquipment.map((item) => {
                const IconComponent = getIconForCategory(item.originalType)
                return (
                  <div
                    key={item.id}
                    className="equipment-card"
                    onClick={() => setSelectedEquipment(item)}
                  >
                    <div className="card-header">
                      <div 
                        className="card-icon"
                        style={{ backgroundColor: getColorForCategory(item.originalType) + '20' }}
                      >
                        <IconComponent 
                          size={24} 
                          style={{ color: getColorForCategory(item.originalType) }} 
                        />
                      </div>
                      <div className="card-info">
                        <div className="equipment-name">{item.name}</div>
                        <div className="equipment-category">{item.category}</div>
                      </div>
                    </div>
                    
                    <div className="card-specs">
                      <div className="spec-item">
                        <span className="spec-label">Dimensions ({units}):</span>
                        <span className="spec-value">
                          {formatDimensions(item.dimensions)}
                        </span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Volume:</span>
                        <span className="spec-value">{item.volume ? `${item.volume} CBM` : 'N/A'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Max Weight:</span>
                        <span className="spec-value">{item.maxWeight ? `${item.maxWeight} kg` : 'N/A'}</span>
                      </div>
                      {item.tempRange && (
                        <div className="spec-item">
                          <span className="spec-label">Temperature:</span>
                          <span className="spec-value">{item.tempRange}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-footer">
                      <button className="view-details-btn">
                        View Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Equipment Details Modal */}
        {selectedEquipment && (
          <div className="modal-overlay" onClick={() => setSelectedEquipment(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <button
                  className="modal-close"
                  onClick={() => setSelectedEquipment(null)}
                >
                  <X size={24} />
                </button>
                <div className="modal-title-section">
                  <div className="modal-icon" style={{ background: getColorForCategory(selectedEquipment.originalType) + '20' }}>
                    {(() => {
                      const IconComponent = getIconForCategory(selectedEquipment.originalType)
                      return <IconComponent size={24} style={{ color: getColorForCategory(selectedEquipment.originalType) }} />
                    })()}
                  </div>
                  <div>
                    <h2 className="modal-title">{selectedEquipment.name}</h2>
                    <p className="modal-category">{selectedEquipment.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="modal-body">
                <p className="modal-description">{selectedEquipment.description}</p>
                
                <div className="modal-unit-toggle">
                  <button
                    onClick={() => setUnits('cm')}
                    className={`modal-unit-btn ${units === 'cm' ? 'active' : ''}`}
                  >
                    Centimeters
                  </button>
                  <button
                    onClick={() => setUnits('in')}
                    className={`modal-unit-btn ${units === 'in' ? 'active' : ''}`}
                  >
                    Inches
                  </button>
                </div>
                
                <div className="specs-grid">
                  {Object.entries(selectedEquipment.specs || {})
                    .filter(([key]) => {
                      // Only show dimensions for current unit selection
                      if (key.includes('Dimensions')) {
                        return key.includes(`(${units})`)
                      }
                      return true
                    })
                    .map(([key, value], index) => (
                    <div key={index} className="spec-row">
                      <span className="spec-label">{key.replace(` (${units})`, '')}:</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  className="copy-specs-btn"
                  onClick={() => copyToClipboard(selectedEquipment.copyText, selectedEquipment.id)}
                >
                  {copiedSpecs === selectedEquipment.id ? (
                    <>
                      <CheckCircle size={16} />
                      Copied!
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
          </div>
        )}
      </div>
    </div>
  )
}

export default Equipment