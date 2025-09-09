import { Package } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <Package className="logo-icon" />
              <span className="logo-text">CargoSizer</span>
              <span className="logo-subtitle">Tools</span>
            </div>
            <p className="footer-description">
              Free tools for freight forwarding professionals. Simple, fast, and always available.
            </p>
          </div>
          <div className="footer-links">
            <h3>Tools</h3>
            <ul>
              <li><a href="/calculators">Weight Calculator</a></li>
              <li><a href="/equipment">Container Guide</a></li>
              <li><a href="/calculators">Tracking</a></li>
              <li><a href="/carriers">Carrier Links</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 CargoSizer Tools. Free freight forwarding utilities.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer