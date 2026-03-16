import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, CheckCircle, XCircle, Clock, ArrowLeft, 
  Calendar, BookOpen, Users, Plus, Copy 
} from 'lucide-react';

// Define the exact shape of our settings object
interface PortalSettings {
  status: string;
  comingSoonDate: string;
  programs: {
    ug: boolean;
    pg: boolean;
    jupeb: boolean;
  };
}

const defaultSettings: PortalSettings = {
  status: 'coming_soon',
  comingSoonDate: '',
  programs: { ug: true, pg: true, jupeb: true }
};

const AdminDashboard = () => {
  // Load complex settings object from local storage
  const [settings, setSettings] = useState<PortalSettings>(() => {
    const saved = localStorage.getItem('portal_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Load generated agent codes from local storage
  const [agentCodes, setAgentCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('portal_agent_codes');
    return saved ? JSON.parse(saved) : [];
  });

  // Master update function for portal settings
  const updateSettings = (newSettings: PortalSettings) => {
    setSettings(newSettings);
    localStorage.setItem('portal_settings', JSON.stringify(newSettings));
  };

  const handleStatusChange = (status: string) => {
    updateSettings({ ...settings, status });
  };

  const handleProgramToggle = (programKey: 'ug' | 'pg' | 'jupeb') => {
    updateSettings({
      ...settings,
      programs: { ...settings.programs, [programKey]: !settings.programs[programKey] }
    });
  };

  // Generate a new Agent Code (CRF-XXXX)
  const generateAgentCode = () => {
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `CRF-${randomString}`;
    
    const updatedCodes = [newCode, ...agentCodes];
    setAgentCodes(updatedCodes);
    localStorage.setItem('portal_agent_codes', JSON.stringify(updatedCodes));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`${code} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Admission Controls (Takes up 2/3 space) */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden h-fit">
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <h1 className="text-xl md:text-2xl font-bold">Portal Administration</h1>
            </div>
            <Link to="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> View Live Site
            </Link>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
              Manage Admission Status
            </h2>

            <div className="space-y-4">
              {/* OPEN BUTTON */}
              <div className={`p-4 rounded-lg border-2 transition-all ${settings.status === 'open' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStatusChange('open')}>
                  <div className="flex items-center gap-4">
                    <CheckCircle className={`w-8 h-8 ${settings.status === 'open' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-bold text-gray-900">Open Admissions</h3>
                      <p className="text-sm text-gray-500">Allows users to purchase the form.</p>
                    </div>
                  </div>
                </div>
                
                {/* Program Toggles */}
                {settings.status === 'open' && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" aria-hidden="true" /> Select which programs are active:
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <label htmlFor="ug-toggle" className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100 transition">
                        <input id="ug-toggle" type="checkbox" checked={settings.programs.ug} onChange={() => handleProgramToggle('ug')} className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold">Undergraduate</span>
                      </label>
                      <label htmlFor="pg-toggle" className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100 transition">
                        <input id="pg-toggle" type="checkbox" checked={settings.programs.pg} onChange={() => handleProgramToggle('pg')} className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold">Postgraduate</span>
                      </label>
                      <label htmlFor="jupeb-toggle" className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100 transition">
                        <input id="jupeb-toggle" type="checkbox" checked={settings.programs.jupeb} onChange={() => handleProgramToggle('jupeb')} className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold">JUPEB</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* COMING SOON BUTTON */}
              <div className={`p-4 rounded-lg border-2 transition-all ${settings.status === 'coming_soon' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}>
                <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStatusChange('coming_soon')}>
                  <div className="flex items-center gap-4">
                    <Clock className={`w-8 h-8 ${settings.status === 'coming_soon' ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-bold text-gray-900">Coming Soon</h3>
                      <p className="text-sm text-gray-500">Displays a waiting message and opening date.</p>
                    </div>
                  </div>
                </div>

                {/* Date Picker */}
                {settings.status === 'coming_soon' && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <label htmlFor="openingDate" className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" aria-hidden="true" /> Set Official Opening Date:
                    </label>
                    <input 
                      id="openingDate"
                      type="date" 
                      value={settings.comingSoonDate} 
                      onChange={(e) => updateSettings({ ...settings, comingSoonDate: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none bg-white"
                    />
                  </div>
                )}
              </div>

              {/* CLOSED BUTTON */}
              <div className={`p-4 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${settings.status === 'closed' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`} onClick={() => handleStatusChange('closed')}>
                <div className="flex items-center gap-4">
                  <XCircle className={`w-8 h-8 ${settings.status === 'closed' ? 'text-red-600' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="font-bold text-gray-900">Close Admissions</h3>
                    <p className="text-sm text-gray-500">Shuts down the portal entirely.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Agent Management */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-fit border-t-4 border-blue-600">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Agent Management
            </h2>
            <p className="text-xs text-gray-500 mb-6">Generate official CRF referral codes for your agents.</p>

            <button 
              onClick={generateAgentCode}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md mb-6"
            >
              <Plus className="w-5 h-5" /> Generate CRF Code
            </button>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Codes</h3>
              {agentCodes.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No codes generated yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {agentCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="font-mono font-bold text-gray-800 tracking-wide">{code}</span>
                      <button 
                        onClick={() => copyToClipboard(code)}
                        className="text-gray-400 hover:text-blue-600 transition p-1"
                        title="Copy to clipboard"
                        aria-label={`Copy ${code} `}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;