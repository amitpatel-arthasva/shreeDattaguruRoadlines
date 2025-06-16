import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Background from './components/common/Background.jsx'
import ProtectedLayout from './components/common/ProtectedLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import PublicRoute from './components/common/PublicRoute.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ToastProvider } from './components/common/ToastSystem.jsx'
// import LorryReceipts from './pages/LorryReceiptList.jsx'
import LorryReceipts from './pages/LorryReceipts.jsx'
import Trucks from './pages/Trucks.jsx'
import Drivers from './pages/Drivers.jsx'
import Companies from './pages/Companies.jsx'
import Settings from './pages/Settings.jsx'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Background>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* Protected routes with outlet */}
              <Route path="/" element={<ProtectedLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="lorry-receipts" element={<LorryReceipts />} />
                <Route path="trucks" element={<Trucks />} />
                <Route path="drivers" element={<Drivers />} />
                <Route path="companies" element={<Companies />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Settings />} />
              </Route>
            </Routes>
          </Background>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
