import { useState } from 'react'
import { Box, Package, Truck, Plane, Ship, Calculator, Ruler, Weight } from 'lucide-react'

const PlanningModule = () => {
  const [activeTab, setActiveTab] = useState('3d-planning')

  const tabs = [
    { id: '3d-planning', label: '3D Planning', icon: Box },
    { id: 'equipment', label: 'Equipment Optimization', icon: Package },
    { id: 'volume', label: 'Volume Calculator', icon: Ruler },
    { id: 'weight', label: 'Weight Calculator', icon: Weight }
  ]

  const planningTools = [
    {
      title: "Container Load Planning",
      description: "Optimize cargo placement in 20ft, 40ft, and 45ft containers",
      icon: <Box className="tool-icon" />,
      features: ["3D visualization", "Weight distribution", "Space utilization", "Load securing"]
    },
    {
      title: "Aircraft Loading",
      description: "Plan cargo placement in aircraft holds and ULD containers",
      icon: <Plane className="tool-icon" />,
      features: ["ULD optimization", "Weight & balance", "Volume efficiency", "Load sequence"]
    },
    {
      title: "Truck Loading",
      description: "Optimize trailer and truck cargo configurations",
      icon: <Truck className="tool-icon" />,
      features: ["Trailer types", "Weight limits", "Dimension checks", "Route planning"]
    },
    {
      title: "Vessel Planning",
      description: "Plan container placement on vessels and terminals",
      icon: <Ship className="tool-icon" />,
      features: ["Bay planning", "Stack optimization", "Port efficiency", "Vessel stability"]
    }
  ]

  const equipmentTypes = [
    {
      category: "Air Freight Containers (ULD)",
      items: [
        { name: "LD3", dimensions: "156 x 125 x 162 cm", volume: "4.5 m³", weight: "1,588 kg" },
        { name: "LD7", dimensions: "318 x 224 x 162 cm", volume: "9.9 m³", weight: "3,175 kg" },
        { name: "LD9", dimensions: "318 x 224 x 162 cm", volume: "12.1 m³", weight: "6,804 kg" },
        { name: "AKE", dimensions: "154 x 153 x 162 cm", volume: "4.2 m³", weight: "1,588 kg" }
      ]
    },
    {
      category: "Sea Freight Containers",
      items: [
        { name: "20ft Standard", dimensions: "591 x 235 x 239 cm", volume: "33.2 m³", weight: "28,230 kg" },
        { name: "40ft Standard", dimensions: "1203 x 235 x 239 cm", volume: "67.7 m³", weight: "30,480 kg" },
        { name: "40ft High Cube", dimensions: "1203 x 235 x 269 cm", volume: "76.3 m³", weight: "30,480 kg" },
        { name: "45ft High Cube", dimensions: "1352 x 235 x 269 cm", volume: "86.0 m³", weight: "30,480 kg" }
      ]
    },
    {
      category: "Road Transport",
      items: [
        { name: "Standard Trailer", dimensions: "1356 x 255 x 270 cm", volume: "93.5 m³", weight: "26,000 kg" },
        { name: "Mega Trailer", dimensions: "1356 x 255 x 300 cm", volume: "104.6 m³", weight: "26,000 kg" },
        { name: "Box Truck", dimensions: "730 x 250 x 250 cm", volume: "45.6 m³", weight: "12,000 kg" },
        { name: "Van", dimensions: "400 x 180 x 190 cm", volume: "13.7 m³", weight: "3,500 kg" }
      ]
    }
  ]

  const renderContent = () => {
    switch(activeTab) {
      case '3d-planning':
        return (
          <div className="planning-content">
            <div className="content-header">
              <h2>3D Cargo Planning Tools</h2>
              <p>Visualize and optimize your cargo loading with advanced 3D planning tools</p>
            </div>
            
            <div className="tools-grid">
              {planningTools.map((tool, index) => (
                <div key={index} className="tool-card">
                  <div className="tool-header">
                    {tool.icon}
                    <h3>{tool.title}</h3>
                  </div>
                  <p className="tool-description">{tool.description}</p>
                  <ul className="tool-features">
                    {tool.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                  <button className="tool-button">Launch Tool</button>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'equipment':
        return (
          <div className="equipment-content">
            <div className="content-header">
              <h2>Equipment Optimization</h2>
              <p>Find the best equipment types for your cargo and optimize utilization</p>
            </div>
            
            <div className="equipment-categories">
              {equipmentTypes.map((category, index) => (
                <div key={index} className="equipment-category">
                  <h3 className="category-title">{category.category}</h3>
                  <div className="equipment-grid">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="equipment-card">
                        <h4 className="equipment-name">{item.name}</h4>
                        <div className="equipment-specs">
                          <div className="spec-item">
                            <span className="spec-label">Dimensions:</span>
                            <span className="spec-value">{item.dimensions}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Volume:</span>
                            <span className="spec-value">{item.volume}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Max Weight:</span>
                            <span className="spec-value">{item.weight}</span>
                          </div>
                        </div>
                        <button className="select-equipment-btn">Select Equipment</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'volume':
        return (
          <div className="calculator-content">
            <div className="content-header">
              <h2>Volume Calculator</h2>
              <p>Calculate cargo volumes, CBM, and space utilization</p>
            </div>
            
            <div className="calculator-tools">
              <div className="calculator-card">
                <h3>Cubic Meter (CBM) Calculator</h3>
                <div className="calculator-inputs">
                  <div className="input-group">
                    <label>Length (cm)</label>
                    <input type="number" placeholder="Enter length" />
                  </div>
                  <div className="input-group">
                    <label>Width (cm)</label>
                    <input type="number" placeholder="Enter width" />
                  </div>
                  <div className="input-group">
                    <label>Height (cm)</label>
                    <input type="number" placeholder="Enter height" />
                  </div>
                  <div className="input-group">
                    <label>Quantity</label>
                    <input type="number" placeholder="Number of pieces" />
                  </div>
                </div>
                <button className="calculate-btn">Calculate Volume</button>
                <div className="result-display">
                  <div className="result-item">
                    <span>Total CBM:</span>
                    <span className="result-value">0.00 m³</span>
                  </div>
                </div>
              </div>
              
              <div className="calculator-card">
                <h3>Container Utilization</h3>
                <div className="utilization-display">
                  <div className="container-visual">
                    <div className="container-outline">
                      <div className="cargo-fill" style={{height: '0%'}}></div>
                    </div>
                  </div>
                  <div className="utilization-stats">
                    <div className="stat-item">
                      <span>Used Space:</span>
                      <span>0%</span>
                    </div>
                    <div className="stat-item">
                      <span>Available:</span>
                      <span>100%</span>
                    </div>
                    <div className="stat-item">
                      <span>Efficiency:</span>
                      <span>Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'weight':
        return (
          <div className="calculator-content">
            <div className="content-header">
              <h2>Weight Calculator</h2>
              <p>Calculate chargeable weight for air and ocean freight</p>
            </div>
            
            <div className="weight-calculators">
              <div className="calculator-card">
                <h3>Air Freight Chargeable Weight</h3>
                <div className="calculator-inputs">
                  <div className="input-group">
                    <label>Gross Weight (kg)</label>
                    <input type="number" placeholder="Actual weight" />
                  </div>
                  <div className="input-group">
                    <label>Volume (m³)</label>
                    <input type="number" placeholder="Total volume" />
                  </div>
                  <div className="input-group">
                    <label>Conversion Factor</label>
                    <select>
                      <option value="167">167 kg/m³ (Standard)</option>
                      <option value="200">200 kg/m³ (Premium)</option>
                    </select>
                  </div>
                </div>
                <button className="calculate-btn">Calculate Chargeable Weight</button>
                <div className="result-display">
                  <div className="result-item">
                    <span>Volumetric Weight:</span>
                    <span className="result-value">0 kg</span>
                  </div>
                  <div className="result-item">
                    <span>Chargeable Weight:</span>
                    <span className="result-value highlight">0 kg</span>
                  </div>
                </div>
              </div>
              
              <div className="calculator-card">
                <h3>Ocean Freight Calculator</h3>
                <div className="calculator-inputs">
                  <div className="input-group">
                    <label>Weight (kg)</label>
                    <input type="number" placeholder="Total weight" />
                  </div>
                  <div className="input-group">
                    <label>Volume (m³)</label>
                    <input type="number" placeholder="Total volume" />
                  </div>
                  <div className="input-group">
                    <label>Container Type</label>
                    <select>
                      <option value="20">20ft Container</option>
                      <option value="40">40ft Container</option>
                      <option value="40hc">40ft High Cube</option>
                    </select>
                  </div>
                </div>
                <button className="calculate-btn">Calculate</button>
                <div className="result-display">
                  <div className="result-item">
                    <span>Container Utilization:</span>
                    <span className="result-value">0%</span>
                  </div>
                  <div className="result-item">
                    <span>Recommended:</span>
                    <span className="result-value">Select container</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="planning-module">
      <div className="planning-header">
        <h1>3D Planning & Equipment Optimization</h1>
        <p>Advanced tools for cargo planning, equipment selection, and load optimization</p>
      </div>
      
      <div className="planning-tabs">
        {tabs.map(tab => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <IconComponent className="tab-icon" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
      
      <div className="planning-content-wrapper">
        {renderContent()}
      </div>
    </div>
  )
}

export default PlanningModule