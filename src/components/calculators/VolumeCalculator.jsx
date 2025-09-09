import { useState, useEffect } from 'react'
import { calculateVolume } from '../../services/calculationService'
import { getAllEquipment, getEquipmentByCategory } from '../../services/equipmentService'

const VolumeCalculator = () => {
    
  const [container, setContainer] = useState('20ft')
  const [units, setUnits] = useState('cm')
  const [cargo, setCargo] = useState([
    { length: '', width: '', height: '', quantity: '' }
  ])
  const [results, setResults] = useState(null)
  const [backendStatus, setBackendStatus] = useState('unknown')
  const [calculating, setCalculating] = useState(false)
  const [useBackend, setUseBackend] = useState(false) // Toggle for backend vs local
  
  // Load equipment data
  const allEquipment = getAllEquipment()
  const equipmentByCategory = getEquipmentByCategory()

  useEffect(() => {
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://freight-calculator-backend.onrender.com'}/api/health`, {
        method: 'GET'
      })
      if (response.ok) {
        setBackendStatus('connected')
      } else {
        setBackendStatus('disconnected')
      }
    } catch (error) {
      console.error('Backend connection check failed:', error)
      setBackendStatus('disconnected')
    }
  }

  checkBackendStatus()
}, [])

useEffect(() => {
  const performCalculation = async () => {
    if (cargo.some(item => item.length && item.width && item.height && item.quantity)) {
      setCalculating(true)
      
      try {
        // Use the enhanced calculation service
        const calculationResult = await calculateVolume(cargo, container, units, useBackend)
        
        if (calculationResult) {
          const containerInfo = allEquipment[container]
          if (containerInfo) {
            // Enhanced results with spatial validation
            const enhancedResults = {
              ...calculationResult,
              containerInfo,
              containerVolume: containerInfo.volume,
              containerName: containerInfo.name,
              maxWeight: containerInfo.maxWeight,
              spatiallyValid: calculationResult.spatiallyValid || false,
              fittingIssues: calculationResult.fittingIssues || [],
              loadingSequence: calculationResult.loadingSequence || []
            }

            // Calculate utilization based on spatial fitting if available
            let utilizationPercent
            if (useBackend && calculationResult.spatiallyValid !== undefined) {
              // Use spatial calculation results only
              const fittedVolume = parseFloat(calculationResult.fittedVolume) || 0
                            
              utilizationPercent = containerInfo.volume > 0 
                ? (fittedVolume / containerInfo.volume * 100).toFixed(1)
                : '0.0'
              
              // Override total volume with actual calculation
              enhancedResults.fittedVolume = fittedVolume.toFixed(3)
              } else {
              // Fallback to simple volume calculation
              const totalVolume = parseFloat(calculationResult.totalVolume) || 0
              utilizationPercent = totalVolume > 0 
                ? (totalVolume / containerInfo.volume * 100).toFixed(1)
                : '0.0'
            }

            setResults({
              ...enhancedResults,
              utilization: utilizationPercent
            })
          }
        }
      } catch (error) {
        console.error('Calculation failed:', error)
        // Show user-friendly error message
        setResults({
          error: 'Calculation failed. Please check your inputs and try again.',
          totalVolume: '0.000',
          utilization: '0.0'
        })
      } finally {
        setCalculating(false)
      }
    } else {
      setResults(null)
    }
  }

  performCalculation()
}, [cargo, container, units, allEquipment, useBackend])

  // Add cargo item
  const addCargoItem = () => {
    setCargo([...cargo, { length: '', width: '', height: '', quantity: '' }])
  }

  // Remove cargo item
  const removeCargoItem = (index) => {
    const newCargo = cargo.filter((_, i) => i !== index)
    setCargo(newCargo.length > 0 ? newCargo : [{ length: '', width: '', height: '', quantity: '' }])
  }

  // Update cargo item
  const updateCargoItem = (index, field, value) => {
    const newCargo = [...cargo]
    newCargo[index][field] = value
    setCargo(newCargo)
  }

  return (
    <div>
      <h2 className="calculator-title">Volume & Container Calculator</h2>

      {/* Calculation Method Toggle */}
      <div className="form-group">
        <label className="form-label">
          Calculation Method
          <span className={`backend-status ${backendStatus}`}>
            {backendStatus === 'connected' && '🟢 Backend Connected'}
            {backendStatus === 'disconnected' && '🔴 Backend Offline'}
            {backendStatus === 'unknown' && '🟡 Checking Connection...'}
          </span>
        </label>
        <div className="mode-buttons">
          <button
            onClick={() => setUseBackend(false)}
            className={`mode-btn ${!useBackend ? 'mode-btn-active' : ''}`}
          >
            Simple Volume
          </button>
          <button
            onClick={() => setUseBackend(true)}
            className={`mode-btn ${useBackend ? 'mode-btn-active' : ''} ${backendStatus === 'disconnected' ? 'disabled' : ''}`}
            disabled={backendStatus === 'disconnected'}
          >
            3D Spatial Fitting
            {backendStatus === 'disconnected' && ' (Offline)'}
          </button>
        </div>
        <div className="calculation-method-info">
          {useBackend ? (
            <p className="method-description">
              <span className="method-icon">🎯</span>
              Advanced 3D bin packing with real spatial constraints - shows actual fitting results
              {backendStatus === 'disconnected' && (
                <span className="offline-notice">
                  <br />⚠️ Backend offline - will use local calculation as fallback
                </span>
              )}
            </p>
          ) : (
            <p className="method-description">
              <span className="method-icon">📊</span>
              Basic volume calculation - assumes optimal packing (may not reflect real loading)
            </p>
          )}
        </div>
      </div>

      {/* Unit Selection */}
      <div className="form-group">
        <label className="form-label">Dimension Units</label>
        <div className="mode-buttons">
          <button
            onClick={() => setUnits('cm')}
            className={`mode-btn ${units === 'cm' ? 'mode-btn-active' : ''}`}
          >
            Centimeters
          </button>
          <button
            onClick={() => setUnits('in')}
            className={`mode-btn ${units === 'in' ? 'mode-btn-active' : ''}`}
          >
            Inches
          </button>
        </div>
      </div>

      {/* Container Selection */}
      <div className="form-group">
        <label className="form-label">Container Type</label>
        <select
          value={container}
          onChange={(e) => setContainer(e.target.value)}
          className="form-input container-select"
        >
          {Object.entries(equipmentByCategory).map(([category, containerList]) => (
            <optgroup key={category} label={category}>
              {containerList.map((cont) => (
                <option key={cont.id} value={cont.id}>
                  {cont.name} ({cont.volume} CBM)
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Container Details */}
      {allEquipment[container] && (allEquipment[container].tempRange || allEquipment[container].powerRequired !== undefined) && (
        <div className="container-details">
          <h4 className="details-title">Container Specifications</h4>
          <div className="details-grid">
            {allEquipment[container].tempRange && (
              <div className="detail-item">
                <span className="detail-label">Temperature Range:</span>
                <span className="detail-value">{allEquipment[container].tempRange}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Power Required:</span>
              <span className="detail-value">
                {allEquipment[container].powerRequired ? "Yes (Active)" : "No (Passive)"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Internal Dimensions:</span>
              <span className="detail-value">
                {allEquipment[container].dimensions ? 
                  `${allEquipment[container].dimensions.length} × ${allEquipment[container].dimensions.width} × ${allEquipment[container].dimensions.height} cm` :
                  'Not specified'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cargo Items Input Section */}
      <div className="form-group">
        <label className="form-label">Cargo Items</label>
        {cargo.map((item, index) => (
          <div key={index} className="cargo-item">
            <div className="cargo-item-header">
              <span className="item-number">Item {index + 1}</span>
              {cargo.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCargoItem(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="cargo-inputs-clean">
              <div className="dimensions-section">
                <label className="dimensions-title">Dimensions ({units})</label>
                <div className="dimensions-grid">
                  <div className="dimension-field">
                    <label>Length</label>
                    <input
                      type="number"
                      value={item.length}
                      onChange={(e) => updateCargoItem(index, 'length', e.target.value)}
                      className="form-input"
                      placeholder=""
                    />
                  </div>
                  <div className="dimension-field">
                    <label>Width</label>
                    <input
                      type="number"
                      value={item.width}
                      onChange={(e) => updateCargoItem(index, 'width', e.target.value)}
                      className="form-input"
                      placeholder=""
                    />
                  </div>
                  <div className="dimension-field">
                    <label>Height</label>
                    <input
                      type="number"
                      value={item.height}
                      onChange={(e) => updateCargoItem(index, 'height', e.target.value)}
                      className="form-input"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
              <div className="quantity-section">
                <label>Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateCargoItem(index, 'quantity', e.target.value)}
                  className="form-input"
                  placeholder=""
                  min="1"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addCargoItem}
          className="add-btn"
        >
          + Add Another Item
        </button>
      </div>

      {/* Calculation Status */}
      {calculating && (
        <div className="calculation-status">
          <div className="loading-spinner"></div>
          <span>Calculating optimal loading...</span>
        </div>
      )}

      {/* Results Section */}
      {results && !calculating && (
        <div className="results-section">
          <h3 className="results-title">
            {useBackend ? '3D Spatial Analysis' : 'Volume Analysis'}
          </h3>
          
          {results.error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {results.error}
            </div>
          )}

          {!results.error && (
            <>
              <div className="results-grid">
                <div className="result-card">
                  <div className="result-label">Total Cargo Volume</div>
                  <div className="result-value">{results.totalVolume} CBM</div>
                </div>
                
                <div className="result-card">
                  <div className="result-label">Container: {results.containerName}</div>
                  <div className="result-value">{results.containerVolume} CBM</div>
                </div>
                
                <div className="result-card utilization-card">
                  <div className="result-label">
                    {useBackend ? 'Spatial Utilization' : 'Volume Utilization'}
                  </div>
                  <div className="result-value utilization-value">
                    {results.utilization}%
                    {parseFloat(results.utilization) > 100 && (
                      <span className="overflow-warning">
                        {(parseFloat(results.utilization) - 100).toFixed(1)}% overflow
                      </span>
                    )}
                    {parseFloat(results.utilization) <= 100 && parseFloat(results.utilization) > 0 && (
                      <span className="all-fit-info">
                        {useBackend && results.spatiallyValid ? 'All cargo fits spatially' : 'All cargo will fit'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="result-card">
                  <div className="result-label">Max Weight Capacity</div>
                  <div className="result-value">{results.maxWeight} kg</div>
                </div>
              </div>

              {/* Spatial Validation Results */}
              {useBackend && results.spatiallyValid !== undefined && (
                <div className="spatial-results">
                  <div className={`spatial-status ${results.spatiallyValid ? 'valid' : 'invalid'}`}>
                    <span className="status-icon">
                      {results.spatiallyValid ? '✅' : '❌'}
                    </span>
                    <span className="status-text">
                      {results.spatiallyValid ? 
                        'All items can be physically loaded' : 
                        'Some items cannot fit due to spatial constraints'
                      }
                    </span>
                  </div>

                  {results.fittingIssues && results.fittingIssues.length > 0 && (
                    <div className="fitting-issues">
                      <h4>Loading Issues Detected:</h4>
                      <ul>
                        {results.fittingIssues.map((issue, index) => (
                          <li key={index} className="issue-item">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Method Comparison Warning */}
              {!useBackend && (
                <div className="method-warning">
                  <span className="warning-icon">⚠️</span>
                  <div className="warning-content">
                    <strong>Important:</strong> This calculation assumes perfect packing efficiency. 
                    Real loading may require more space due to cargo shape, accessibility, and loading constraints.
                    <br />
                    <button 
                      onClick={() => setUseBackend(true)}
                      className="upgrade-btn"
                    >
                      Use 3D Spatial Analysis for accurate results
                    </button>
                  </div>
                </div>
              )}

              {/* Rest of existing results display */}
              {results.cargoDetails && results.cargoDetails.length > 0 && (
                <div className="cargo-breakdown">
                  <h4 className="breakdown-title">Item Breakdown</h4>
                  <div className="breakdown-table">
                    <div className="breakdown-header">
                      <span>Item</span>
                      <span>Dimensions</span>
                      <span>Qty</span>
                      <span>Unit Vol</span>
                      <span>Total Vol</span>
                      {useBackend && <span>Status</span>}
                    </div>
                    {results.cargoDetails.map((detail, index) => (
                      <div key={index} className="breakdown-row">
                        <span>#{detail.index}</span>
                        <span className="dimensions">{detail.dimensions}</span>
                        <span>{detail.quantity}</span>
                        <span>{detail.unitVolume} CBM</span>
                        <span className="total-vol">{detail.totalVolume} CBM</span>
                        {useBackend && (
                          <span className={`fitting-status ${detail.fitted !== false ? 'fitted' : 'not-fitted'}`}>
                            {detail.fitted !== false ? '✅ Fits' : '❌ No space'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Recommendations */}
              <div className="recommendations">
                <h4 className="recommendations-title">Recommendations</h4>
                <div className="recommendation-items">
                  {useBackend && results.spatiallyValid === false && (
                    <div className="recommendation alert">
                      <span className="rec-icon">🚨</span>
                      <span>Spatial constraints prevent optimal loading - consider larger container or reduce cargo</span>
                    </div>
                  )}
                  {parseFloat(results.utilization) < 60 && (
                    <div className="recommendation warning">
                      <span className="rec-icon">⚠️</span>
                      <span>Low utilization - consider smaller container or consolidate shipments</span>
                    </div>
                  )}
                  {parseFloat(results.utilization) > 85 && parseFloat(results.utilization) <= 95 && (
                    <div className="recommendation success">
                      <span className="rec-icon">✅</span>
                      <span>Excellent utilization - optimal container size</span>
                    </div>
                  )}
                  {parseFloat(results.utilization) > 95 && (
                    <div className="recommendation alert">
                      <span className="rec-icon">🚨</span>
                      <span>Very tight fit - consider larger container for safer loading</span>
                    </div>
                  )}
                  {!useBackend && parseFloat(results.utilization) > 80 && (
                    <div className="recommendation info">
                      <span className="rec-icon">💡</span>
                      <span>High utilization detected - verify with 3D spatial analysis for accurate loading assessment</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default VolumeCalculator