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
  { id: '7', name: 'Aisha Bello', pin: 'CUB-2026-B9Y2', program: 'Undergraduate', refCode: 'CRF-A1B2', status: 'completed', date: 'Mar 18, 2026' },
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

  // Agent Form & Pagination State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [agentPage, setAgentPage] = useState(1);
  const agentsPerPage = 3;

  // Applicant Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
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

  // Generate Agent
  const generateAgentCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentPhone) return alert("Please enter both Name and Phone Number.");

    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `CRF-${randomString}`;
    
    const newAgent: Agent = { code: newCode, name: newAgentName, phone: newAgentPhone, uses: 0 };
    const updatedAgents = [newAgent, ...agents];
    
    setAgents(updatedAgents);
    localStorage.setItem('portal_agents', JSON.stringify(updatedAgents));
    
    // Clear form and jump back to page 1 to see the new agent
    setNewAgentName('');
    setNewAgentPhone('');
    setAgentPage(1);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`${code} copied to clipboard!`);
  };

  // --- CALCULATIONS FOR UI ---

  // 1. Applicant Filtering & Pagination
  const filteredApplicants = mockApplicants.filter(app => {
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.pin.toLowerCase().includes(query) ||
      app.refCode.toLowerCase().includes(query) ||
      app.program.toLowerCase().includes(query)
    );
  });

  const totalApplicants = filteredApplicants.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalApplicants / itemsPerPage) || 1; // Prevent 0 pages

  // Quick Stats (Based on the full mock list, not filtered)
  const statsTotal = mockApplicants.length;
  const statsCompleted = mockApplicants.filter(a => a.status === 'completed').length;
  const statsOngoing = mockApplicants.filter(a => a.status === 'ongoing').length;

  // 2. Agent Pagination
  const totalAgentPages = Math.ceil(agents.length / agentsPerPage) || 1;
  const indexOfLastAgent = agentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = agents.slice(indexOfFirstAgent, indexOfLastAgent);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 md:p-6 rounded-xl shadow-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" aria-hidden="true" />
            <h1 className="text-xl md:text-2xl font-bold">Admin Control Center</h1>
          </div>
          <Link to="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1 transition-colors bg-slate-800 px-3 py-1.5 rounded-lg">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Live Site
          </Link>
        </div>

        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Applicants</p>
              <p className="text-2xl font-black text-gray-900">{statsTotal}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Completed Biodata</p>
              <p className="text-2xl font-black text-gray-900">{statsCompleted}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-yellow-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Ongoing (Drafts)</p>
              <p className="text-2xl font-black text-gray-900">{statsOngoing}</p>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Settings & Agents */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* LEFT: Admission Controls */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" aria-hidden="true" /> Portal Status
              </h2>

              <div className="space-y-4">
                {/* OPEN */}
                <div className={`p-4 rounded-lg border transition-all ${settings.status === 'open' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStatusChange('open')}>
                    <div className="flex items-center gap-4">
                      <CheckCircle className={`w-8 h-8 ${settings.status === 'open' ? 'text-green-600' : 'text-gray-400'}`} aria-hidden="true" />
                      <div>
                        <h3 className="font-bold text-gray-900">Open Admissions</h3>
                        <p className="text-sm text-gray-500">Portal is active and accepting payments.</p>
                      </div>
                    </div>
                  </div>
                  {settings.status === 'open' && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" aria-hidden="true" /> Active Programs:
                      </p>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <label htmlFor="ug-toggle" className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input id="ug-toggle" type="checkbox" checked={settings.programs.ug} onChange={() => handleProgramToggle('ug')} className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold">Undergraduate</span>
                        </label>
                        <label htmlFor="pg-toggle" className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input id="pg-toggle" type="checkbox" checked={settings.programs.pg} onChange={() => handleProgramToggle('pg')} className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold">Postgraduate</span>
                        </label>
                        <label htmlFor="jupeb-toggle" className="flex items-center gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input id="jupeb-toggle" type="checkbox" checked={settings.programs.jupeb} onChange={() => handleProgramToggle('jupeb')} className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold">JUPEB</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* COMING SOON */}
                <div className={`p-4 rounded-lg border transition-all ${settings.status === 'coming_soon' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStatusChange('coming_soon')}>
                    <div className="flex items-center gap-4">
                      <Clock className={`w-8 h-8 ${settings.status === 'coming_soon' ? 'text-yellow-600' : 'text-gray-400'}`} aria-hidden="true" />
                      <div>
                        <h3 className="font-bold text-gray-900">Coming Soon</h3>
                        <p className="text-sm text-gray-500">Show waiting message.</p>
                      </div>
                    </div>
                  </div>
                  {settings.status === 'coming_soon' && (
                    <div className="mt-4 pt-4 border-t border-yellow-200">
                      <label htmlFor="openingDate" className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" aria-hidden="true" /> Official Opening Date:
                      </label>
                      <input id="openingDate" type="date" value={settings.comingSoonDate} onChange={(e) => updateSettings({ ...settings, comingSoonDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-yellow-300 outline-none bg-white" />
                    </div>
                  )}
                </div>

                {/* CLOSED */}
                <div className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${settings.status === 'closed' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`} onClick={() => handleStatusChange('closed')}>
                  <div className="flex items-center gap-4">
                    <XCircle className={`w-8 h-8 ${settings.status === 'closed' ? 'text-red-600' : 'text-gray-400'}`} aria-hidden="true" />
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-fit flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-blue-50/50">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" aria-hidden="true" /> Agent Referrals
              </h2>
              <p className="text-xs text-gray-500 mb-4">Create tracked CRF codes.</p>

              <form onSubmit={generateAgentCode} className="space-y-3">
                <input aria-label="Agent Name" type="text" required placeholder="Agent Name" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} className="w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500" />
                <input aria-label="Agent Phone Number" type="tel" required placeholder="Phone Number" value={newAgentPhone} onChange={(e) => setNewAgentPhone(e.target.value)} className="w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500" />
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm">
                  <Plus className="w-4 h-4" aria-hidden="true" /> Generate Code
                </button>
              </form>
            </div>

            {/* Agent List with internal Pagination */}
            <div className="p-4 flex-grow">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Active Agents</h3>
              {agents.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-4">No agents created.</p>
              ) : (
                <div className="space-y-3 min-h-[180px]">
                  {currentAgents.map((agent, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900">{agent.name}</span>
                        <button onClick={() => copyToClipboard(agent.code)} className="text-blue-600 hover:text-blue-800" title="Copy Code" aria-label="Copy Code">
                          <Copy className="w-4 h-4" aria-hidden="true" />
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

              {/* Agent Pagination Controls */}
              {agents.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button 
                    aria-label="Previous agents page"
                    onClick={() => setAgentPage(prev => Math.max(prev - 1, 1))}
                    disabled={agentPage === 1}
                    className="p-1 rounded bg-white text-gray-500 hover:text-blue-600 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span className="text-[10px] font-bold text-gray-500">Page {agentPage} of {totalAgentPages}</span>
                  <button 
                    aria-label="Next agents page"
                    onClick={() => setAgentPage(prev => Math.min(prev + 1, totalAgentPages))}
                    disabled={agentPage === totalAgentPages}
                    className="p-1 rounded bg-white text-gray-500 hover:text-blue-600 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Applicant Tracking Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" /> Applicant Tracking
              </h2>
              <p className="text-xs text-gray-500">Monitor payments and biodata submissions.</p>
            </div>
            
            {/* Functional Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
              <input 
                aria-label="Search applicants by PIN, Name, Program, or Agent"
                type="text" 
                placeholder="Search PIN, Name, Agent..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to page 1 when searching!
                }}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full md:w-64 bg-gray-50 focus:bg-white transition-colors" 
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
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
                {currentApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-gray-500 italic">
                      No applicants match your search.
                    </td>
                  </tr>
                ) : (
                  currentApplicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900 text-sm">{applicant.name}</td>
                      <td className="p-4 text-sm text-gray-600">{applicant.program}</td>
                      <td className="p-4"><span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-gray-200">{applicant.pin}</span></td>
                      <td className="p-4 text-sm text-gray-500">{applicant.refCode}</td>
                      <td className="p-4">
                        {applicant.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                            <CheckCircle className="w-3 h-3" aria-hidden="true" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                            <Clock className="w-3 h-3" aria-hidden="true" /> Ongoing
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right text-xs text-gray-500 whitespace-nowrap">{applicant.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalApplicants > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, totalApplicants)}</span> of <span className="font-bold text-gray-900">{totalApplicants}</span>
              </p>
              <div className="flex items-center gap-2">
                <button 
                  aria-label="Previous page"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="text-xs font-bold text-gray-700 px-2">Page {currentPage} of {totalPages}</span>
                <button 
                  aria-label="Next page"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;