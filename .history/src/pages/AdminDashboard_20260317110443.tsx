import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, CheckCircle, XCircle, Clock, ArrowLeft, 
  Calendar, BookOpen, Users, Plus, Copy, 
  BarChart3, FileText, Activity, ChevronLeft, ChevronRight, Search
} from 'lucide-react';

// --- INTERFACES ---
interface PortalSettings {
  status: string;
  comingSoonDate: string;
  programs: { ug: boolean; pg: boolean; jupeb: boolean; };
}

interface Agent {
  code: string;
  name: string;
  phone: string;
  uses: number;
}

interface Applicant {
  id: string;
  name: string;
  pin: string;
  program: string;
  refCode: string;
  status: 'completed' | 'ongoing';
  date: string;
}

const defaultSettings: PortalSettings = {
  status: 'coming_soon',
  comingSoonDate: '',
  programs: { ug: true, pg: true, jupeb: true }
};

// --- MOCK DATA FOR UI TESTING ---
const mockApplicants: Applicant[] = [
  { id: '1', name: 'David Ojo', pin: 'CUB-2026-X8F2', program: 'Undergraduate', refCode: 'CRF-A1B2', status: 'completed', date: 'Mar 15, 2026' },
  { id: '2', name: 'Oiza Ibrahim', pin: 'CUB-2026-J9K3', program: 'Postgraduate', refCode: '-', status: 'ongoing', date: 'Mar 16, 2026' },
  { id: '3', name: 'Samuel Emmanuel', pin: 'CUB-2026-P2M4', program: 'Undergraduate', refCode: 'CRF-Z9Y8', status: 'completed', date: 'Mar 16, 2026' },
  { id: '4', name: 'Grace Adeyemi', pin: 'CUB-2026-L5N6', program: 'JUPEB', refCode: 'CRF-A1B2', status: 'ongoing', date: 'Mar 17, 2026' },
  { id: '5', name: 'Tobi Daniels', pin: 'CUB-2026-W3E4', program: 'Undergraduate', refCode: '-', status: 'completed', date: 'Mar 17, 2026' },
  { id: '6', name: 'Chioma Eze', pin: 'CUB-2026-R7T8', program: 'Postgraduate', refCode: 'CRF-QWER', status: 'completed', date: 'Mar 17, 2026' },
];

const AdminDashboard = () => {
  // --- STATE ---
  const [settings, setSettings] = useState<PortalSettings>(() => {
    const saved = localStorage.getItem('portal_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('portal_agents');
    return saved ? JSON.parse(saved) : [];
  });

  // Agent Form State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // --- HANDLERS ---
  const updateSettings = (newSettings: PortalSettings) => {
    setSettings(newSettings);
    localStorage.setItem('portal_settings', JSON.stringify(newSettings));
  };

  const handleStatusChange = (status: string) => updateSettings({ ...settings, status });
  const handleProgramToggle = (programKey: 'ug' | 'pg' | 'jupeb') => {
    updateSettings({ ...settings, programs: { ...settings.programs, [programKey]: !settings.programs[programKey] } });
  };

  // Generate Agent with Name & Phone
  const generateAgentCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentPhone) return alert("Please enter both Name and Phone Number.");

    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `CRF-${randomString}`;
    
    const newAgent: Agent = { code: newCode, name: newAgentName, phone: newAgentPhone, uses: 0 };
    const updatedAgents = [newAgent, ...agents];
    
    setAgents(updatedAgents);
    localStorage.setItem('portal_agents', JSON.stringify(updatedAgents));
    
    // Clear form
    setNewAgentName('');
    setNewAgentPhone('');
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`${code} copied to clipboard!`);
  };

  // --- CALCULATIONS FOR UI ---
  const totalApplicants = mockApplicants.length;
  const completedApplicants = mockApplicants.filter(a => a.status === 'completed').length;
  const ongoingApplicants = mockApplicants.filter(a => a.status === 'ongoing').length;

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = mockApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(mockApplicants.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 md:p-6 rounded-xl shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl md:text-2xl font-bold">Admin Control Center</h1>
          </div>
          <Link to="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1 transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <ArrowLeft className="w-4 h-4" /> Live Site
          </Link>
        </div>

        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Applicants</p>
              <p className="text-2xl font-black text-gray-900">{totalApplicants}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Completed Biodata</p>
              <p className="text-2xl font-black text-gray-900">{completedApplicants}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Ongoing (Drafts)</p>
              <p className="text-2xl font-black text-gray-900">{ongoingApplicants}</p>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Settings & Agents */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* LEFT: Admission Controls */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" /> Portal Status
              </h2>

              <div className="space-y-4">
                {/* OPEN */}
                <div className={`p-4 rounded-lg border-2 transition-all ${settings.status === 'open' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStatusChange('open')}>
                    <div className="flex items-center gap-4">
                      <CheckCircle className={`w-8 h-8 ${settings.status === 'open' ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <h3 className="font-bold text-gray-900">Open Admissions</h3>
                        <p className="text-sm text-gray-500">Portal is active and accepting payments.</p>
                      </div>
                    </div>
                  </div>
                  {settings.status === 'open' && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Active Programs:
                      </p>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input type="checkbox" checked={settings.programs.ug} onChange={() => handleProgramToggle('ug')} className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold">Undergraduate</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input type="checkbox" checked={settings.programs.pg} onChange={() => handleProgramToggle('pg')} className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold">Postgraduate</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input type="checkbox" checked={settings.programs.jupeb} onChange={() => handleProgramToggle('jupeb')} className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold">JUPEB</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* COMING SOON */}
                <div className={`p-4 rounded-lg border-2 transition-all ${settings.status === 'coming_soon' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStatusChange('coming_soon')}>
                    <div className="flex items-center gap-4">
                      <Clock className={`w-8 h-8 ${settings.status === 'coming_soon' ? 'text-yellow-600' : 'text-gray-400'}`} />
                      <div>
                        <h3 className="font-bold text-gray-900">Coming Soon</h3>
                        <p className="text-sm text-gray-500">Show waiting message.</p>
                      </div>
                    </div>
                  </div>
                  {settings.status === 'coming_soon' && (
                    <div className="mt-4 pt-4 border-t border-yellow-200">
                      <label className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Official Opening Date:
                      </label>
                      <input type="date" value={settings.comingSoonDate} onChange={(e) => updateSettings({ ...settings, comingSoonDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-yellow-300 outline-none bg-white" />
                    </div>
                  )}
                </div>

                {/* CLOSED */}
                <div className={`p-4 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${settings.status === 'closed' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`} onClick={() => handleStatusChange('closed')}>
                  <div className="flex items-center gap-4">
                    <XCircle className={`w-8 h-8 ${settings.status === 'closed' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-bold text-gray-900">Close Admissions</h3>
                      <p className="text-sm text-gray-500">Shut down the portal entirely.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Agent Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit flex flex-col max-h-[600px]">
            <div className="p-6 border-b border-gray-100 bg-blue-50/50">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Agent Referral Codes
              </h2>
              <p className="text-xs text-gray-500 mb-4">Create tracked CRF codes for marketers.</p>

              <form onSubmit={generateAgentCode} className="space-y-3">
                <input type="text" required placeholder="Agent Name" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} className="w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500" />
                <input type="tel" required placeholder="Phone Number" value={newAgentPhone} onChange={(e) => setNewAgentPhone(e.target.value)} className="w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500" />
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Generate Code
                </button>
              </form>
            </div>

            <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Active Agents</h3>
              {agents.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-4">No agents created.</p>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900">{agent.name}</span>
                        <button onClick={() => copyToClipboard(agent.code)} className="text-blue-600 hover:text-blue-800" title="Copy Code">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{agent.phone}</p>
                      <div className="flex justify-between items-center bg-white border border-gray-200 rounded px-2 py-1">
                        <span className="font-mono font-bold text-blue-700 tracking-wide text-xs">{agent.code}</span>
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{agent.uses} Uses</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Applicant Tracking Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Applicant Tracking
              </h2>
              <p className="text-xs text-gray-500">Monitor payments and biodata submissions.</p>
            </div>
            {/* Search Bar Mockup */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input type="text" placeholder="Search PIN or Name..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full md:w-64" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">Applicant Name</th>
                  <th className="p-4 font-semibold">Program</th>
                  <th className="p-4 font-semibold">App PIN</th>
                  <th className="p-4 font-semibold">Agent Ref</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900 text-sm">{applicant.name}</td>
                    <td className="p-4 text-sm text-gray-600">{applicant.program}</td>
                    <td className="p-4"><span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{applicant.pin}</span></td>
                    <td className="p-4 text-sm text-gray-500">{applicant.refCode}</td>
                    <td className="p-4">
                      {applicant.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                          <Clock className="w-3 h-3" /> Ongoing
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right text-xs text-gray-500 whitespace-nowrap">{applicant.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, totalApplicants)}</span> of <span className="font-bold text-gray-900">{totalApplicants}</span> applicants
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-700 px-2">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;