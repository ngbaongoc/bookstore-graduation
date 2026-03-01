
/*The structure that is shared across all pages of the bookstore*/


import { Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Banner from './pages/home/Banner.jsx'
function App() {


  return (
    <>
      <Navbar />
      <main className="min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-primary">
        <Outlet />
      </main>

      <footer> Footer </footer>
    </>
  )
}

export default App
