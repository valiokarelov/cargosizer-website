import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Calculators from './pages/Calculators'
import PlanningModule from './pages/PlanningModule'
import Tracking from './pages/Tracking'
import CarrierLinks from './pages/CarrierLinks'
import Equipment from './pages/Equipment'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blue-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/planning" element={<PlanningModule />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/carriers" element={<CarrierLinks />} />
            <Route path="/equipment" element={<Equipment />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App