import { useState, useEffect } from 'react'

const WeightCalculator = () => {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '',
    weight: ''
  })
  const [mode, setMode] = useState('air') // air or ocean
  const [units, setUnits] = useState({
    dimension: 'cm', // cm or in
    weight: 'kg' // kg or lbs
  })
  const [results, setResults] = useState(null)

  useEffect(() => {
    if (dimensions.length !== '' && dimensions.width !== '' && dimensions.height !== '' && dimensions.weight !== '') {
      const { length, width, height, weight } = dimensions
      let l = parseFloat(length) || 0
      let w = parseFloat(width) || 0
      let h = parseFloat(height) || 0
      let actualWeight = parseFloat(weight) || 0

      // Convert to metric if needed
      if (units.dimension === 'in') {
        l = l * 2.54 // inches to cm
        w = w * 2.54
        h = h * 2.54
      }
      
      if (units.weight === 'lbs') {
        actualWeight = actualWeight * 0.453592 // pounds to kg
      }

      if (l > 0 && w > 0 && h > 0 && actualWeight > 0) {
        // Volume in cubic meters
        const volumeCBM = (l * w * h) / 1000000

        // Volumetric weight calculation
        let volumetricWeight
        if (mode === 'air') {
          volumetricWeight = volumeCBM * 167
        } else {
          volumetricWeight = volumeCBM * 1000
        }

        const chargeableWeight = Math.max(actualWeight, volumetricWeight)

        // Convert results back to user's preferred units for display
        const displayActualWeight = units.weight === 'lbs' ? actualWeight / 0.453592 : actualWeight
        const displayVolumetricWeight = units.weight === 'lbs' ? volumetricWeight / 0.453592 : volumetricWeight
        const displayChargeableWeight = units.weight === 'lbs' ? chargeableWeight / 0.453592 : chargeableWeight

        setResults({
          volumeCBM: volumeCBM.toFixed(3),
          volumetricWeight: displayVolumetricWeight.toFixed(1),
          chargeableWeight: displayChargeableWeight.toFixed(1),
          actualWeight: displayActualWeight.toFixed(1)
        })
      } else {
        setResults(null)
      }
    } else {
      setResults(null)
    }
  }, [dimensions, mode, units])

  const handleInputChange = (field, value) => {
    setDimensions(prev => ({ ...prev, [field]: value }))
  }

  const handleUnitChange = (unitType, value) => {
    setUnits(prev => ({ ...prev, [unitType]: value }))
  }

  return (
    <div>
      <h2 className="calculator-title">Chargeable Weight Calculator</h2>
      
      {/* Unit Selection */}
      <div className="form-group">
        <label className="form-label">Units</label>
        <div className="unit-controls">
          <div className="unit-group">
            <span className="unit-label">Dimensions:</span>
            <div className="mode-buttons">
              <button
                onClick={() => handleUnitChange('dimension', 'cm')}
                className={`mode-btn ${units.dimension === 'cm' ? 'mode-btn-active' : ''}`}
              >
                cm
              </button>
              <button
                onClick={() => handleUnitChange('dimension', 'in')}
                className={`mode-btn ${units.dimension === 'in' ? 'mode-btn-active' : ''}`}
              >
                inches
              </button>
            </div>
          </div>
          <div className="unit-group">
            <span className="unit-label">Weight:</span>
            <div className="mode-buttons">
              <button
                onClick={() => handleUnitChange('weight', 'kg')}
                className={`mode-btn ${units.weight === 'kg' ? 'mode-btn-active' : ''}`}
              >
                kg
              </button>
              <button
                onClick={() => handleUnitChange('weight', 'lbs')}
                className={`mode-btn ${units.weight === 'lbs' ? 'mode-btn-active' : ''}`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="form-group">
        <label className="form-label">Transport Mode</label>
        <div className="mode-buttons">
          <button
            onClick={() => setMode('air')}
            className={`mode-btn ${mode === 'air' ? 'mode-btn-active' : ''}`}
          >
            Air Freight
          </button>
          <button
            onClick={() => setMode('ocean')}
            className={`mode-btn ${mode === 'ocean' ? 'mode-btn-active' : ''}`}
          >
            Ocean Freight
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="calculator-grid">
        <div className="input-section">
          <h3 className="section-title">Dimensions ({units.dimension})</h3>
          <div className="dimensions-grid">
            <div className="input-group">
              <label className="input-label">Length</label>
              <input
                type="number"
                value={dimensions.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Width</label>
              <input
                type="number"
                value={dimensions.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Height</label>
              <input
                type="number"
                value={dimensions.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Actual Weight ({units.weight})</label>
            <input
              type="number"
              value={dimensions.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="results-section">
            <h3 className="section-title">Results</h3>
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Volume (CBM):</span>
                <span className="result-value">{results.volumeCBM} m³</span>
              </div>
              <div className="result-item">
                <span className="result-label">Actual Weight:</span>
                <span className="result-value">{results.actualWeight} {units.weight}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Volumetric Weight:</span>
                <span className="result-value">{results.volumetricWeight} {units.weight}</span>
              </div>
              <div className="result-item highlight">
                <span className="result-label">Chargeable Weight:</span>
                <span className="result-value-main">{results.chargeableWeight} {units.weight}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formula Info */}
      <div className="formula-info">
        <h4 className="formula-title">Formula</h4>
        <p className="formula-text">
          {mode === 'air' 
            ? 'Air Freight: Volume (CBM) × 167 kg/m³ = Volumetric Weight'
            : 'Ocean Freight: Volume (CBM) × 1000 kg/m³ = Volumetric Weight'
          }
        </p>
        <p className="formula-text">
          Chargeable Weight = Higher of (Actual Weight, Volumetric Weight)
        </p>
      </div>
    </div>
  )
}

export default WeightCalculator