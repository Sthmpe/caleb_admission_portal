import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Apply from './pages/Apply';
// import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      {/* Navbar shows on all pages */}
      <Navbar /> 
      
      {/* Main content area */}
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<Apply />} />
          
          {/* Secret Admin Route - We will add password protection later */}
          <Route path="/admin-portal-xyz" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;