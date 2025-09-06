import { useState, useEffect } from 'react'
import { calculateVolumeLocally } from '../../services/calculationService'
import { getAllEquipment, getEquipmentByCategory } from '../../services/equipmentService'

const VolumeCalculator = () => {
    
  const [container, setContainer] = useState('20ft')
  const [units, setUnits] = useState('cm')
  const [cargo, setCargo] = useState([
    { length: '', width: '', height: '', quantity: '' }
  ])
  const [results, setResults] = useState(null)
  
  // Load equipment data
  const allEquipment = getAllEquipment()
  const equipmentByCategory = getEquipmentByCategory()

  useEffect(() => {
    // Use the calculation service
    const calculationResult = calculateVolumeLocally(cargo, container, units)
    
    if (calculationResult) {
      const containerInfo = allEquipment[container]
      if (containerInfo) {
        const utilizationPercent = calculationResult.totalVolume > 0 
          ? (calculationResult.totalVolume / containerInfo.volume * 100).toFixed(1)
          : '0.0'

        setResults({
          ...calculationResult,
          containerVolume: containerInfo.volume,
          utilization: utilizationPercent,
          containerName: containerInfo.name,
          maxWeight: containerInfo.maxWeight
        })
      }
    }
  }, [cargo, container, units, allEquipment])

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

      {/* Results Section */}
      {results && (
        <div className="results-section">
          <h3 className="results-title">Volume Analysis</h3>
          
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
              <div className="result-label">Space Utilization</div>
              <div className="result-value utilization-value">
                {results.utilization}%
                {parseFloat(results.utilization) > 100 && (
                  <span className="overflow-warning">
                    {(parseFloat(results.utilization) - 100).toFixed(1)}% overflow
                  </span>
                )}
                {parseFloat(results.utilization) <= 100 && parseFloat(results.utilization) > 0 && (
                  <span className="all-fit-info">
                    All cargo will fit
                  </span>
                )}
              </div>
            </div>
            
            <div className="result-card">
              <div className="result-label">Max Weight Capacity</div>
              <div className="result-value">{results.maxWeight} kg</div>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="utilization-bar">
            <div className="utilization-label">Container Utilization</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(results.utilization, 100)}%` }}
              ></div>
            </div>
            <div className="utilization-text">{results.utilization}% used</div>
          </div>

          {/* Cargo Details Breakdown */}
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
                </div>
                {results.cargoDetails.map((detail, index) => (
                  <div key={index} className="breakdown-row">
                    <span>#{detail.index}</span>
                    <span className="dimensions">{detail.dimensions}</span>
                    <span>{detail.quantity}</span>
                    <span>{detail.unitVolume} CBM</span>
                    <span className="total-vol">{detail.totalVolume} CBM</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="recommendations">
            <h4 className="recommendations-title">Recommendations</h4>
            <div className="recommendation-items">
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VolumeCalculator