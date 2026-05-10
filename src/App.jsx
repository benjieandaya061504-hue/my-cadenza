import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './Admin/Login/Login'
import Dashboard from './Admin/Dashboard/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
