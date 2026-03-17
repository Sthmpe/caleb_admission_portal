import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
import Home from './pages/Home';
import BiodataForm from './pages/BiodataForm';
import Apply from './pages/Apply';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';


function App() {
  return (
    <Router>
      {/* Navbar shows on all pages */}
      {/* <Navbar />  */}
      
      {/* Main content area */}
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/biodata" element={<BiodataForm />} />
          {/* Secret Admin Route - We will add password protection later */}
          <Route path="/admin-portal-xyz" element={<AdminDashboard />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;