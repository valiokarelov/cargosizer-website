import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Calculators from './pages/Calculators'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blue-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculators" element={<Calculators />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App