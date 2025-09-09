import { Calculator, Package, BarChart3, ExternalLink, Clock, CheckCircle, ArrowRight } from 'lucide-react'


const Home = () => {
  const tools = [
    { icon: Calculator, name: "Weight Calculator", description: "Chargeable weight for air & ocean", link: "/calculators" },
    { icon: Package, name: "Container Guide", description: "Dimensions and capacity reference", link: "/equipment" },
    { icon: BarChart3, name: "Tracking", description: "Direct access to tracking sites", link: "/tracking" },
    { icon: ExternalLink, name: "Carrier Links", description: "Direct access to tracking sites", link: "/carriers" }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Free 
                <span className="text-blue-600"> Logistics Professional Toolkit</span>
              </h1>
              <p className="hero-description">
                Streamline your daily workflows with instant access to 
                carrier tracking, container calculations, and logistics references designed for Logistics professionals.
              </p>
              <div className="hero-buttons">
                <a href="/calculators" className="btn-primary">
                  Start Using Tools <ArrowRight className="btn-icon" />
                </a>
                <a href="/equipment" className="btn-secondary">
                  View Container Guide
                </a>
              </div>
              <div className="hero-note">
                <CheckCircle className="note-icon" />
                100% Free • No Registration Required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="tools-section">
        <div className="container">
          <h2 className="section-title">Essential Freight Forwarding Tools</h2>
          <div className="tools-grid">
            {tools.map((tool, index) => (
              <a key={index} href={tool.link} className="tool-card">
                <div className="tool-icon">
                  <tool.icon className="icon" />
                </div>
                <h3 className="tool-name">{tool.name}</h3>
                <p className="tool-description">{tool.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home