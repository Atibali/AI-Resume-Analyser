import { Outlet } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import './app.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
