import { useState, useEffect } from 'react'
import { getEquipmentRecommendations, getEquipmentCategories, filterEquipment } from '../../services/equipmentService'

const EquipmentSelector = ({ onEquipmentSelected, selectedEquipment }) => {
  // Cargo requirements state
  const [requirements, setRequirements] = useState({
    totalVolume: '',
    totalWeight: '',
    temperatureRequired: false,
    tempRange: '',
    maxTransitHours: '',
    routeType: '',
    specialRequirements: []
  })

  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    temperatureControlled: null,
    powerRequired: null,
    showOnlyRecommended: true
  })

  // Results state
  const [recommendations, setRecommendations] = useState([])
  const [allEquipment, setAllEquipment] = useState([])
  const [loading, setLoading] = useState(false)

  // Available options
  const categories = getEquipmentCategories()
  const routeTypes = [
    { value: 'air-express', label: 'Air Express' },
    { value: 'air-pharma', label: 'Air Pharmaceutical' },
    { value: 'ocean-standard', label: 'Ocean Standard' },
    { value: 'truck-domestic', label: 'Truck Domestic' },
    { value: 'truck-expedited', label: 'Truck Expedited' },
    { value: 'intermodal', label: 'Intermodal' }
  ]

  const specialFeatures = [
    'pharma-qualified',
    'temperature-monitoring',
    'GPS-tracking',
    'expedited',
    'door-access',
    'extra-height',
    'recyclable',
    'lightweight',
    'reusable',
    'ultra-low-temp',
    'wide-temp-range'
  ]

  // Calculate recommendations when requirements change
  useEffect(() => {
    if (requirements.totalVolume || requirements.totalWeight) {
      setLoading(true)
      
      // Convert string inputs to numbers
      const processedRequirements = {
        ...requirements,
        totalVolume: parseFloat(requirements.totalVolume) || 0,
        totalWeight: parseFloat(requirements.totalWeight) || 0,
        maxTransitHours: requirements.maxTransitHours ? parseInt(requirements.maxTransitHours) : null
      }

      const recs = getEquipmentRecommendations(processedRequirements)
      setRecommendations(recs)
      setLoading(false)
    } else {
      setRecommendations([])
    }
  }, [requirements])

  // Apply filters to get filtered equipment list
  useEffect(() => {
    const filtered = filterEquipment(filters)
    setAllEquipment(filtered)
  }, [filters])

  const handleRequirementChange = (field, value) => {
    setRequirements(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecialRequirementToggle = (feature) => {
    setRequirements(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.includes(feature)
        ? prev.specialRequirements.filter(f => f !== feature)
        : [...prev.specialRequirements, feature]
    }))
  }

  const handleEquipmentSelect = (equipment) => {
    onEquipmentSelected(equipment)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    if (score >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getUtilizationColor = (utilization) => {
    if (utilization >= 70 && utilization <= 95) return 'text-green-600'
    if (utilization > 95) return 'text-red-600'
    if (utilization >= 50) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const displayEquipment = filters.showOnlyRecommended ? recommendations : 
    allEquipment.map(eq => ({ equipment: eq, score: 0, reasons: [], issues: [], utilization: 0, suitable: true }))

  return (
    <div className="equipment-selector">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cargo Requirements */}
        <div className="requirements-section">
          <h3 className="section-title">Cargo Requirements</h3>
          
          <div className="form-group">
            <label className="form-label">Total Volume (CBM)</label>
            <input
              type="number"
              className="form-input"
              value={requirements.totalVolume}
              onChange={(e) => handleRequirementChange('totalVolume', e.target.value)}
              placeholder="Enter total volume"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Weight (kg)</label>
            <input
              type="number"
              className="form-input"
              value={requirements.totalWeight}
              onChange={(e) => handleRequirementChange('totalWeight', e.target.value)}
              placeholder="Enter total weight"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={requirements.temperatureRequired}
                onChange={(e) => handleRequirementChange('temperatureRequired', e.target.checked)}
              />
              Temperature Control Required
            </label>
          </div>

          {requirements.temperatureRequired && (
            <div className="form-group">
              <label className="form-label">Temperature Range</label>
              <select
                className="form-input"
                value={requirements.tempRange}
                onChange={(e) => handleRequirementChange('tempRange', e.target.value)}
              >
                <option value="">Select temperature range</option>
                <option value="+2°C to +8°C">+2°C to +8°C (Refrigerated)</option>
                <option value="+2°C to +25°C">+2°C to +25°C (Controlled Room Temp)</option>
                <option value="-20°C to +20°C">-20°C to +20°C (Frozen/Ambient)</option>
                <option value="-70°C to +20°C">-70°C to +20°C (Ultra Low Temp)</option>
                <option value="Ambient">Ambient Temperature</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Max Transit Time (hours)</label>
            <input
              type="number"
              className="form-input"
              value={requirements.maxTransitHours}
              onChange={(e) => handleRequirementChange('maxTransitHours', e.target.value)}
              placeholder="Maximum hours in transit"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Route Type</label>
            <select
              className="form-input"
              value={requirements.routeType}
              onChange={(e) => handleRequirementChange('routeType', e.target.value)}
            >
              <option value="">Select route type</option>
              {routeTypes.map(route => (
                <option key={route.value} value={route.value}>
                  {route.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Special Requirements</label>
            <div className="special-features-grid">
              {specialFeatures.map(feature => (
                <label key={feature} className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={requirements.specialRequirements.includes(feature)}
                    onChange={() => handleSpecialRequirementToggle(feature)}
                  />
                  <span className="feature-label">
                    {feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <h3 className="section-title">Filter Equipment</h3>
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Temperature Control</label>
            <select
              className="form-input"
              value={filters.temperatureControlled === null ? '' : filters.temperatureControlled.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                temperatureControlled: e.target.value === '' ? null : e.target.value === 'true'
              }))}
            >
              <option value="">Any</option>
              <option value="true">Temperature Controlled</option>
              <option value="false">No Temperature Control</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Power Requirement</label>
            <select
              className="form-input"
              value={filters.powerRequired === null ? '' : filters.powerRequired.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                powerRequired: e.target.value === '' ? null : e.target.value === 'true'
              }))}
            >
              <option value="">Any</option>
              <option value="true">Active (Power Required)</option>
              <option value="false">Passive (No Power)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.showOnlyRecommended}
                onChange={(e) => setFilters(prev => ({ ...prev, showOnlyRecommended: e.target.checked }))}
              />
              Show Only Recommended
            </label>
          </div>

          {(requirements.totalVolume || requirements.totalWeight) && (
            <div className="recommendations-summary">
              <h4 className="summary-title">Recommendations Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Found:</span>
                  <span className="stat-value">{recommendations.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Suitable:</span>
                  <span className="stat-value text-green-600">
                    {recommendations.filter(r => r.suitable).length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">With Issues:</span>
                  <span className="stat-value text-red-600">
                    {recommendations.filter(r => !r.suitable).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="results-section">
          <h3 className="section-title">
            {filters.showOnlyRecommended ? 'Recommended Equipment' : 'All Equipment'}
          </h3>
          
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Analyzing equipment options...</span>
            </div>
          )}

          {!loading && displayEquipment.length === 0 && (
            <div className="empty-state">
              <p>No equipment found matching your criteria.</p>
              <p className="text-sm text-gray-600">
                Try adjusting your requirements or filters.
              </p>
            </div>
          )}

          <div className="equipment-list">
            {displayEquipment.map((item) => (
              <div 
                key={item.equipment.id} 
                className={`equipment-card ${selectedEquipment?.id === item.equipment.id ? 'selected' : ''}`}
                onClick={() => handleEquipmentSelect(item.equipment)}
              >
                <div className="equipment-header">
                  <div className="equipment-name">
                    {item.equipment.name}
                  </div>
                  {filters.showOnlyRecommended && (
                    <div className={`score-badge ${getScoreColor(item.score)}`}>
                      {item.score}
                    </div>
                  )}
                </div>

                <div className="equipment-details">
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{item.equipment.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">
                      {item.equipment.volume} CBM, {item.equipment.maxWeight} kg
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Temperature:</span>
                    <span className="detail-value">{item.equipment.tempRange}</span>
                  </div>
                  {item.equipment.maxTransitHours && (
                    <div className="detail-row">
                      <span className="detail-label">Max Transit:</span>
                      <span className="detail-value">{item.equipment.maxTransitHours}h</span>
                    </div>
                  )}
                  {filters.showOnlyRecommended && item.utilization > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Utilization:</span>
                      <span className={`detail-value ${getUtilizationColor(item.utilization)}`}>
                        {item.utilization.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {filters.showOnlyRecommended && (
                  <div className="recommendation-details">
                    {item.reasons.length > 0 && (
                      <div className="reasons">
                        <strong>Advantages:</strong>
                        <ul>
                          {item.reasons.map((reason, idx) => (
                            <li key={idx} className="reason-item positive">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.issues.length > 0 && (
                      <div className="issues">
                        <strong>Issues:</strong>
                        <ul>
                          {item.issues.map((issue, idx) => (
                            <li key={idx} className="reason-item negative">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {item.equipment.specialFeatures.length > 0 && (
                  <div className="special-features">
                    {item.equipment.specialFeatures.map(feature => (
                      <span key={feature} className="feature-tag">
                        {feature.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquipmentSelector