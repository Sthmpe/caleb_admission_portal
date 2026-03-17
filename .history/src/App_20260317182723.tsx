import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
import Home from './pages/Home';
import BiodataForm from './pages/BiodataForm';
import Apply from './pages/Apply';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';
import DownloadForm from './pages/DownloadForm'; // 1. Import the new editor

function App() {
  return (
    <Router>
      {/* Main content area */}
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/biodata" element={<BiodataForm />} />
          <Route path="/success" element={<Success />} />

          {/* Secure Editor Route */}
          <Route path="/editor" element={<DownloadForm />} /> {/* 2. Add the route */}

          {/* Secret Admin Route */}
          <Route path="/admin-portal-xyz" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;