import { Package } from 'lucide-react'

const Header = () => {
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Package className="logo-icon" />
              <span className="logo-text">CargoSizer</span>
              <span className="logo-subtitle">Tools</span>
            </div>
            <nav className="nav">
              <a href="/" className="nav-link">Home</a>
              <a href="/calculators" className="nav-link">Calculators</a>
              <a href="/equipment" className="nav-link">Equipment</a>
              <a href="/tracking" className="nav-link">Carriers</a>
              <a href="/planning" className="nav-link">3D Planning</a>
              <a href="/timezones" className="nav-link">Time Zones</a>
            </nav>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Header