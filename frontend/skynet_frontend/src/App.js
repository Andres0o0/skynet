import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Visits from './pages/Visits';
import Users from './pages/Users';
import Settings from './pages/Settings';

import { getUser } from "./utils/storage";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/'; // 👉 oculta navbar solo en login

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/visit" element={<Visits />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
