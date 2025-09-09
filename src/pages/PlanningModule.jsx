import { useState } from 'react'
import EquipmentSelector from '../components/calculators/EquipmentSelector'

const PlanningModule = () => {
  const [activeTab, setActiveTab] = useState('equipment')
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  const handleEquipmentSelected = (equipment) => {
    setSelectedEquipment(equipment)
    // Optionally auto-switch to 3D planner when equipment is selected
    // setActiveTab('3d-planner')
  }

  const tabs = [
    {
      id: 'equipment',
      label: 'Equipment Selector',
      icon: '🔍',
      description: 'Find optimal equipment based on cargo requirements'
    },
    {
      id: '3d-planner',
      label: '3D Loading Planner',
      icon: '📦',
      description: 'Visualize and optimize cargo loading'
    }
  ]

  return (
    <div className="planning-module">
      {/* Header */}
      <div className="module-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="module-title">3D Planning & Equipment Optimization</h1>
            <p className="module-description">
              Intelligent equipment selection and advanced cargo loading optimization
            </p>
          </div>
          
          {selectedEquipment && (
            <div className="selected-equipment-badge">
              <span className="badge-label">Selected Equipment:</span>
              <span className="badge-value">{selectedEquipment.name}</span>
              <button 
                className="clear-selection"
                onClick={() => setSelectedEquipment(null)}
                title="Clear selection"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${
                tab.id === '3d-planner' ? 'coming-soon' : ''
              }`}
              onClick={() => {
                if (tab.id !== '3d-planner') {
                  setActiveTab(tab.id)
                }
              }}
              disabled={tab.id === '3d-planner'}
            >
              <span className="tab-icon">{tab.icon}</span>
              <div className="tab-content">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-description">{tab.description}</span>
                {tab.id === '3d-planner' && (
                  <span className="coming-soon-label">Coming Soon</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content-area">
        {activeTab === 'equipment' && (
          <div className="tab-panel">
            <EquipmentSelector 
              onEquipmentSelected={handleEquipmentSelected}
              selectedEquipment={selectedEquipment}
            />
          </div>
        )}

        {activeTab === '3d-planner' && (
          <div className="tab-panel">
            <div className="coming-soon-panel">
              <div className="coming-soon-content">
                <div className="coming-soon-icon">🚧</div>
                <h3 className="coming-soon-title">3D Loading Planner</h3>
                <p className="coming-soon-text">
                  Advanced 3D cargo optimization with Three.js visualization is currently in development.
                </p>
                <div className="planned-features">
                  <h4>Planned Features:</h4>
                  <ul>
                    <li>Real-time 3D visualization of cargo loading</li>
                    <li>Backend-powered bin packing optimization</li>
                    <li>Interactive loading sequence planning</li>
                    <li>Weight distribution analysis</li>
                    <li>Container utilization optimization</li>
                  </ul>
                </div>
                {selectedEquipment && (
                  <div className="selected-equipment-preview">
                    <h4>Ready for: {selectedEquipment.name}</h4>
                    <p>Capacity: {selectedEquipment.volume} CBM, {selectedEquipment.maxWeight} kg</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Information */}
      <div className="module-footer">
        <div className="workflow-guide">
          <h4 className="guide-title">How to Use This Module</h4>
          <div className="workflow-steps">
            <div className="workflow-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h5>Define Requirements</h5>
                <p>Enter your cargo volume, weight, temperature needs, and transit constraints</p>
              </div>
            </div>
            <div className="workflow-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h5>Review Recommendations</h5>
                <p>Analyze scored equipment options with detailed suitability assessments</p>
              </div>
            </div>
            <div className="workflow-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h5>Select Equipment</h5>
                <p>Choose the optimal equipment for your specific cargo requirements</p>
              </div>
            </div>
            <div className="workflow-step coming-soon-step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h5>Optimize Loading</h5>
                <p>Use 3D planner to visualize and optimize cargo placement (Coming Soon)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanningModule