import { Calculator, Package, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import WeightCalculator from '../components/calculators/WeightCalculator'
import VolumeCalculator from '../components/calculators/VolumeCalculator'

const Calculators = () => {
  const [activeTab, setActiveTab] = useState('weight')

  const tabs = [
    { id: 'weight', name: 'Weight Calculator', icon: Calculator },
    { id: 'volume', name: 'Volume Calculator', icon: Package },
    { id: 'cost', name: 'Cost Estimator', icon: BarChart3 }
  ]

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Freight Calculators</h1>
          <p className="page-description">
            Professional tools for weight, volume, and cost calculations
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
              >
                <tab.icon className="tab-icon" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Content */}
        <div className="calculator-container">
          {activeTab === 'weight' && <WeightCalculator />}
          {activeTab === 'volume' && <VolumeCalculator />}
          {activeTab === 'cost' && (
            <div className="calculator-content">
              <h2 className="calculator-title">Cost Estimator</h2>
              <p>Cost estimator content will go here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calculators