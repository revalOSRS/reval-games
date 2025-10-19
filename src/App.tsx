import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import ProfilePage from './pages/ProfilePage'
import ActiveEventsPage from './pages/ActiveEventsPage'
import BattleshipBingoPage from './pages/BattleshipBingoPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events" element={<ActiveEventsPage />} />
        <Route path="/event/battleship-bingo/:eventId" element={<BattleshipBingoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
