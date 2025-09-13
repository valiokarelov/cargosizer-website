import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Calculators from './pages/Calculators'
import Tracking from './pages/Tracking'
import CarrierLinks from './pages/CarrierLinks'
import Equipment from './pages/Equipment'
import Contact from './pages/Contact'
import ContactSuccess from './pages/ContactSuccess'
import TimeZoneDisplay from './pages/TimeZoneDisplay'
import CargoFitterThree from './pages/CargoFitterThree'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blue-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/planning" element={<CargoFitterThree />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/carriers" element={<CarrierLinks />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact-success" element={<ContactSuccess />} />
            <Route path="/timezones" element={<TimeZoneDisplay />} />
            <Route path="/3d-planning" element={<CargoFitterThree />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App