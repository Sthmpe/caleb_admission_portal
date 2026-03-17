import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, CheckCircle, XCircle, Clock, ArrowLeft, 
  Calendar, BookOpen, Users, Plus, Copy, 
  BarChart3, FileText, Activity, ChevronLeft, ChevronRight, Search, Loader2
} from 'lucide-react';

// --- CONFIG ---
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

// --- INTERFACES ---
interface PortalSettings {
  status: string;
  comingSoonDate: string;
  programs: { ug: boolean; pg: boolean; jupeb: boolean; };
}

interface Agent {
  id?: string;
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
  status: string;
  createdAt: string | Record<string, unknown>; 
}

const AdminDashboard = () => {
  // --- STATE ---
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // UI State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [agentPage, setAgentPage] = useState(1);
  const itemsPerPage = 5;
  const agentsPerPage = 3;

  // --- FETCH INITIAL DATA WITH TIMEOUT ---
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); 

    const fetchDashboardData = async () => {
      try {
        const [settingsRes, agentsRes, applicantsRes] = await Promise.all([
          fetch(`${API_BASE}/api/settings`, { signal: controller.signal }),
          fetch(`${API_BASE}/api/agents`, { signal: controller.signal }),
          fetch(`${API_BASE}/api/applicants`, { signal: controller.signal })
        ]);

        clearTimeout(timeoutId);

        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (agentsRes.ok) setAgents(await agentsRes.json());
        if (applicantsRes.ok) setApplicants(await applicantsRes.json());
        
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error("Dashboard fetch timed out!");
          setErrorMessage("Connection timed out. The database took too long to respond.");
        } else {
          console.error("Error fetching data:", error);
          setErrorMessage("Failed to load dashboard data. Please check your connection.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => clearTimeout(timeoutId);
  }, []);

  // --- HANDLERS ---
  const updateSettings = async (newSettings: PortalSettings) => {
    setSettings(newSettings); 
    try {
      await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (error) {
        console.error("Settings save error:", error);
        alert("Failed to save settings to the database.");
    }
  };

  const handleStatusChange = (status: string) => {
    if (settings) updateSettings({ ...settings, status });
  };

  const handleProgramToggle = (programKey: 'ug' | 'pg' | 'jupeb') => {
    if (settings) {
       updateSettings({ 
         ...settings, 
         programs: { ...settings.programs, [programKey]: !settings.programs[programKey] } 
       });
    }
  };

  const generateAgentCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentPhone) return alert("Please enter both Name and Phone Number.");
    
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAgentName, phone: newAgentPhone })
      });

      if (response.ok) {
        const data = await response.json();
        setAgents([data.agent, ...agents]);
        setNewAgentName('');
        setNewAgentPhone('');
        setAgentPage(1);
      }
    } catch (error) {
        console.error("Agent creation error:", error);
      alert("Failed to generate agent code.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`${code} copied to clipboard!`);
  };

  // --- CALCULATIONS FOR UI ---
  const filteredApplicants = applicants.filter(app => {
    const query = searchQuery.toLowerCase();
    return (
      app.name?.toLowerCase().includes(query) ||
      app.pin?.toLowerCase().includes(query) ||
      app.refCode?.toLowerCase().includes(query) ||
      app.program?.toLowerCase().includes(query)
    );
  });

  const totalApplicants = filteredApplicants.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalApplicants / itemsPerPage) || 1; 

  const totalAgentPages = Math.ceil(agents.length / agentsPerPage) || 1;
  const indexOfLastAgent = agentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = agents.slice(indexOfFirstAgent, indexOfLastAgent);

  const statsTotal = applicants.length;
  const statsRevenue = applicants.length * 10000; 
  const statsAgents = agents.length;

  // --- RENDER LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Connecting to Database...</h2>
      </div>
    );
  }

  // --- RENDER ERROR STATE ---
  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center max-w-md w-full shadow-sm">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Network Error</h2>
          <p className="text-sm font-medium">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 w-full bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8 font-sans pb-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-4 md:p-6 rounded-xl shadow-md flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-blue-400 shrink-0" aria-hidden="true" />
            <h1 className="text-base md:text-2xl font-bold truncate">Admin Control Center</h1>
          </div>
          <Link to="/" className="text-[10px] md:text-sm text-slate-300 hover:text-white flex items-center gap-1 transition-colors bg-slate-800 px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg whitespace-nowrap">
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" /> Live Site
          </Link>
        </div>

        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-3 gap-2 md:gap-6">
          <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4 overflow-hidden">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider truncate">Total Apps</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 truncate">{statsTotal}</p>
            </div>
          </div>
          <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4 overflow-hidden">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 md:w-6 md:h-6 text-green-600" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider truncate">Estimated. Revenue</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 truncate">₦{(statsRevenue / 1000).toFixed(0)}k</p>
            </div>
          </div>
          <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4 overflow-hidden">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 md:w-6 md:h-6 text-purple-600" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider truncate">Agents</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 truncate">{statsAgents}</p>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Settings & Agents */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          
          {/* LEFT: Admission Controls */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
            <div className="p-4 md:p-8">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6 border-b border-gray-100 pb-2 md:pb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-600" aria-hidden="true" /> Portal Status
              </h2>

              <div className="space-y-3 md:space-y-4">
                {/* OPEN */}
                <div className={`p-3 md:p-4 rounded-lg border transition-all ${settings?.status === 'open' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStatusChange('open')}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <CheckCircle className={`w-6 h-6 md:w-8 md:h-8 shrink-0 ${settings?.status === 'open' ? 'text-green-600' : 'text-gray-400'}`} aria-hidden="true" />
                      <div>
                        <h3 className="text-sm md:text-base font-bold text-gray-900">Open Admissions</h3>
                        <p className="text-[10px] md:text-xs text-gray-500">Portal is active and accepting payments.</p>
                      </div>
                    </div>
                  </div>
                  {settings?.status === 'open' && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-green-200">
                      <p className="text-xs md:text-sm font-bold text-green-800 mb-2 md:mb-3 flex items-center gap-2">
                        <BookOpen className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" /> Active Programs:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input type="checkbox" checked={settings.programs.ug} onChange={() => handleProgramToggle('ug')} className="w-3 h-3 md:w-4 md:h-4 text-green-600 shrink-0" />
                          <span className="text-[9px] md:text-sm font-semibold truncate">Undergraduate</span>
                        </label>
                        <label className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input type="checkbox" checked={settings.programs.pg} onChange={() => handleProgramToggle('pg')} className="w-3 h-3 md:w-4 md:h-4 text-green-600 shrink-0" />
                          <span className="text-[9px] md:text-sm font-semibold truncate">Postgraduate</span>
                        </label>
                        <label className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 bg-white p-2 rounded border border-green-200 cursor-pointer hover:bg-green-100">
                          <input type="checkbox" checked={settings.programs.jupeb} onChange={() => handleProgramToggle('jupeb')} className="w-3 h-3 md:w-4 md:h-4 text-green-600 shrink-0" />
                          <span className="text-[9px] md:text-sm font-semibold truncate">JUPEB</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* COMING SOON */}
                <div className={`p-3 md:p-4 rounded-lg border transition-all ${settings?.status === 'coming_soon' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStatusChange('coming_soon')}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <Clock className={`w-6 h-6 md:w-8 md:h-8 shrink-0 ${settings?.status === 'coming_soon' ? 'text-yellow-600' : 'text-gray-400'}`} aria-hidden="true" />
                      <div>
                        <h3 className="text-sm md:text-base font-bold text-gray-900">Coming Soon</h3>
                        <p className="text-[10px] md:text-xs text-gray-500">Show waiting message.</p>
                      </div>
                    </div>
                  </div>
                  {settings?.status === 'coming_soon' && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-yellow-200">
                      <label htmlFor="openingDate" className="text-[10px] md:text-sm font-bold text-yellow-800 mb-1 md:mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" /> Official Opening Date:
                      </label>
                      <input id="openingDate" type="date" value={settings.comingSoonDate} onChange={(e) => updateSettings({ ...settings, comingSoonDate: e.target.value })} className="w-full p-2 text-[10px] md:text-base rounded-lg border border-yellow-300 outline-none bg-white" />
                    </div>
                  )}
                </div>

                {/* CLOSED */}
                <div className={`p-3 md:p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${settings?.status === 'closed' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`} onClick={() => handleStatusChange('closed')}>
                  <div className="flex items-center gap-3 md:gap-4">
                    <XCircle className={`w-6 h-6 md:w-8 md:h-8 shrink-0 ${settings?.status === 'closed' ? 'text-red-600' : 'text-gray-400'}`} aria-hidden="true" />
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-gray-900">Close Admissions</h3>
                      <p className="text-[10px] md:text-xs text-gray-500">Shut down the portal entirely.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Agent Management */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-fit flex flex-col">
            <div className="p-4 md:p-6 border-b border-gray-100 bg-blue-50/50">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" aria-hidden="true" /> Agent Referrals
              </h2>
              <p className="text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4">Create tracked CRF codes.</p>

              <form onSubmit={generateAgentCode} className="space-y-2 md:space-y-3">
                <input aria-label="Agent Name" type="text" required placeholder="Agent Name" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} className="w-full p-2 text-[10px] md:text-sm border border-gray-200 rounded outline-none focus:border-blue-500" />
                <input aria-label="Agent Phone Number" type="tel" required placeholder="Phone Number" value={newAgentPhone} onChange={(e) => setNewAgentPhone(e.target.value)} className="w-full p-2 text-[10px] md:text-sm border border-gray-200 rounded outline-none focus:border-blue-500" />
                <button type="submit" disabled={isGenerating} className="w-full bg-blue-600 text-white font-bold py-2 md:py-2.5 rounded hover:bg-blue-700 transition flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-sm disabled:opacity-50">
                  {isGenerating ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" aria-hidden="true" /> : <Plus className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />} 
                  {isGenerating ? 'Generating...' : 'Generate Code'}
                </button>
              </form>
            </div>

            {/* Agent List with internal Pagination */}
            <div className="p-3 md:p-4 flex-grow">
              <h3 className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 md:mb-3">Active Agents</h3>
              {agents.length === 0 ? (
                <p className="text-[10px] md:text-xs text-gray-500 italic text-center py-4">No agents created yet.</p>
              ) : (
                <div className="space-y-2 md:space-y-3 min-h-[160px] md:min-h-[180px]">
                  {currentAgents.map((agent, index) => (
                    <div key={agent.id || index} className="bg-gray-50 p-2 md:p-3 rounded-lg border border-gray-200 text-[10px] md:text-sm overflow-hidden">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900 truncate pr-2 text-[11px] md:text-sm">{agent.name}</span>
                        <button onClick={() => copyToClipboard(agent.code)} className="text-blue-600 hover:text-blue-800 shrink-0 p-1" title="Copy Code" aria-label="Copy Code">
                          <Copy className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-[9px] md:text-xs text-gray-500 mb-1.5 md:mb-2 truncate">{agent.phone}</p>
                      <div className="flex justify-between items-center bg-white border border-gray-200 rounded px-1.5 md:px-2 py-1">
                        <span className="font-mono font-bold text-blue-700 tracking-wide text-[9px] md:text-xs truncate mr-1">{agent.code}</span>
                        <span className="text-[8px] md:text-[10px] font-bold bg-green-100 text-green-800 px-1.5 md:px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">{agent.uses} Uses</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agent Pagination Controls */}
              {agents.length > 0 && (
                <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button 
                    aria-label="Previous agents page"
                    onClick={() => setAgentPage(prev => Math.max(prev - 1, 1))}
                    disabled={agentPage === 1}
                    className="p-1 rounded bg-white text-gray-500 hover:text-blue-600 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                  </button>
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-500 whitespace-nowrap">Page {agentPage} of {totalAgentPages}</span>
                  <button 
                    aria-label="Next agents page"
                    onClick={() => setAgentPage(prev => Math.min(prev + 1, totalAgentPages))}
                    disabled={agentPage === totalAgentPages}
                    className="p-1 rounded bg-white text-gray-500 hover:text-blue-600 disabled:opacity-30"
                  >
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Applicant Tracking Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" aria-hidden="true" /> Applicant Tracking
              </h2>
              <p className="text-[10px] md:text-xs text-gray-500">Monitor Monnify payments and submissions.</p>
            </div>
            
            {/* Functional Search Bar */}
            <div className="relative w-full sm:w-auto">
              <Search className="w-3 h-3 md:w-4 md:h-4 absolute left-2.5 md:left-3 top-[10px] md:top-2.5 text-gray-400" aria-hidden="true" />
              <input 
                aria-label="Search applicants by PIN, Name, Program, or Agent"
                type="text" 
                placeholder="Search CUL PIN, Name..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to page 1 when searching
                }}
                className="pl-7 md:pl-9 pr-3 md:pr-4 py-1.5 md:py-2 border border-gray-200 rounded-lg text-[10px] md:text-sm focus:outline-none focus:border-blue-500 w-full sm:w-48 md:w-64 bg-gray-50 focus:bg-white transition-colors" 
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[250px] md:min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[9px] md:text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-3 md:p-4 font-semibold whitespace-nowrap">Name</th>
                  <th className="p-3 md:p-4 font-semibold whitespace-nowrap">Program</th>
                  <th className="p-3 md:p-4 font-semibold whitespace-nowrap">App PIN</th>
                  <th className="p-3 md:p-4 font-semibold whitespace-nowrap">Agent</th>
                  <th className="p-3 md:p-4 font-semibold whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 md:p-8 text-center text-[10px] md:text-sm text-gray-500 italic">
                      No applicants found in the database.
                    </td>
                  </tr>
                ) : (
                  currentApplicants.map((applicant) => (
                    <tr key={applicant.id || applicant.pin} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-3 md:p-4 font-bold text-gray-900 text-[11px] md:text-sm whitespace-nowrap">{applicant.name}</td>
                      <td className="p-3 md:p-4 text-[10px] md:text-sm text-gray-600 whitespace-nowrap">{applicant.program === 'Undergraduate' ? 'UG' : applicant.program === 'Postgraduate' ? 'PG' : applicant.program}</td>
                      <td className="p-3 md:p-4 whitespace-nowrap"><span className="font-mono text-[9px] md:text-xs font-bold text-slate-600 bg-slate-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded border border-gray-200">{applicant.pin}</span></td>
                      <td className="p-3 md:p-4 text-[10px] md:text-sm text-gray-500 whitespace-nowrap">{applicant.refCode === 'DIRECT' ? '-' : applicant.refCode}</td>
                      <td className="p-3 md:p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-0.5 md:gap-1 bg-green-100 text-green-700 text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase">
                           <CheckCircle className="w-2 h-2 md:w-3 md:h-3" aria-hidden="true" /> Paid
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalApplicants > 0 && (
            <div className="p-3 md:p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <p className="text-[9px] md:text-xs text-gray-500 whitespace-nowrap">
                Showing <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, totalApplicants)}</span> of <span className="font-bold text-gray-900">{totalApplicants}</span>
              </p>
              <div className="flex items-center gap-1 md:gap-2">
                <button 
                  aria-label="Previous page"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 md:p-1.5 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                </button>
                <span className="text-[9px] md:text-xs font-bold text-gray-700 px-1 md:px-2 whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                <button 
                  aria-label="Next page"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 md:p-1.5 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
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