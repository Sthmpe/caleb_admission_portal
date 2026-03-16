import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const [currentStatus, setCurrentStatus] = useState<string>('coming_soon');

  // Lazy initialization: reads from localStorage ONLY on the first load
  const [currentStatus, setCurrentStatus] = useState<string>(() => {
    return localStorage.getItem('portal_status') || 'coming_soon';
  });

  // Update the status and save it
  const updateStatus = (status: string) => {
    localStorage.setItem('portal_status', status);
    setCurrentStatus(status);
    alert(`Success! The portal is now: ${status.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <h1 className="text-xl md:text-2xl font-bold">Portal Administration</h1>
          </div>
          <Link to="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> View Live Site
          </Link>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
            Manage Admission Status
          </h2>

          <div className="space-y-4">
            {/* OPEN BUTTON */}
            <div 
              className={`p-4 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${
                currentStatus === 'open' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => updateStatus('open')}
            >
              <div className="flex items-center gap-4">
                <CheckCircle className={`w-8 h-8 ${currentStatus === 'open' ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <h3 className="font-bold text-gray-900">Open Admissions</h3>
                  <p className="text-sm text-gray-500">Allows users to purchase the ₦10,000 form.</p>
                </div>
              </div>
            </div>

            {/* CLOSED BUTTON */}
            <div 
              className={`p-4 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${
                currentStatus === 'closed' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
              }`}
              onClick={() => updateStatus('closed')}
            >
              <div className="flex items-center gap-4">
                <XCircle className={`w-8 h-8 ${currentStatus === 'closed' ? 'text-red-600' : 'text-gray-400'}`} />
                <div>
                  <h3 className="font-bold text-gray-900">Close Admissions</h3>
                  <p className="text-sm text-gray-500">Shuts down the portal and hides the purchase button.</p>
                </div>
              </div>
            </div>

            {/* COMING SOON BUTTON */}
            <div 
              className={`p-4 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${
                currentStatus === 'coming_soon' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
              }`}
              onClick={() => updateStatus('coming_soon')}
            >
              <div className="flex items-center gap-4">
                <Clock className={`w-8 h-8 ${currentStatus === 'coming_soon' ? 'text-yellow-600' : 'text-gray-400'}`} />
                <div>
                  <h3 className="font-bold text-gray-900">Coming Soon</h3>
                  <p className="text-sm text-gray-500">Displays a waiting message for the upcoming session.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;