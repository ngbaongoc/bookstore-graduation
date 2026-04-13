import { Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-primary bg-white">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default App
