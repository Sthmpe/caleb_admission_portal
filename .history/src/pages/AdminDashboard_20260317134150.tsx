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
  createdAt: any; 
}

const AdminDashboard = () => {
  // --- STATE ---
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [agentPage, setAgentPage] = useState(1);
  const itemsPerPage = 5;
  const agentsPerPage = 3;

  // --- FETCH DATA FROM API ---
  const loadDashboardData = async () => {
    try {
      const [setRes, agentRes, appRes] = await Promise.all([
        fetch(`${API_BASE}/api/settings`),
        fetch(`${API_BASE}/api/agents`),
        fetch(`${API_BASE}/api/applicants`)
      ]);
      
      if (setRes.ok) setSettings(await setRes.json());
      if (agentRes.ok) setAgents(await agentRes.json());
      if (appRes.ok) setApplicants(await appRes.json());
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // --- HANDLERS ---
  const updateSettings = async (newSettings: PortalSettings) => {
    setSettings(newSettings); // Optimistic UI
    try {
      await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      alert("Failed to save settings to cloud.");
    }
  };

  const handleStatusChange = (status: string) => {
    if (settings) updateSettings({ ...settings, status });
  };

  const handleProgramToggle = (key: keyof PortalSettings['programs']) => {
    if (settings) {
      updateSettings({ 
        ...settings, 
        programs: { ...settings.programs, [key]: !settings.programs[key] } 
      });
    }
  };

  const generateAgentCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentPhone) return;
    
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAgentName, phone: newAgentPhone })
      });
      if (res.ok) {
        const data = await res.json();
        setAgents([data.agent, ...agents]);
        setNewAgentName('');
        setNewAgentPhone('');
        setAgentPage(1);
      }
    } catch (err) {
      alert("Error generating agent.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`${code} copied!`);
  };

  // --- CALCULATIONS ---
  const filteredApplicants = applicants.filter(app => {
    const q = searchQuery.toLowerCase();
    return app.name?.toLowerCase().includes(q) || app.pin?.toLowerCase().includes(q) || app.refCode?.toLowerCase().includes(q);
  });

  const currentApplicants = filteredApplicants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentAgents = agents.slice((agentPage - 1) * agentsPerPage, agentPage * agentsPerPage);

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-4 font-bold text-gray-600">Syncing with University Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl md:text-2xl font-bold">Admin Control Center</h1>
          </div>
          <Link to="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg">
            <ArrowLeft className="w-4 h-4" /> Live Site
          </Link>
        </div>

        {/* TOP METRICS (REAL DATA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center"><Users className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Applicants</p>
              <p className="text-2xl font-black">{applicants.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center"><FileText className="text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Revenue (Estimated)</p>
              <p className="text-2xl font-black">₦{(applicants.length * 10000).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center"><Activity className="text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Active Agents</p>
              <p className="text-2xl font-black">{agents.length}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* PORTAL STATUS */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-3">
              <BarChart3 className="text-blue-600" /> Portal Controls
            </h2>
            <div className="space-y-4">
              {['open', 'coming_soon', 'closed'].map((status) => (
                <div 
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${settings.status === status ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-4">
                    {status === 'open' ? <CheckCircle className={settings.status === status ? 'text-green-600' : 'text-gray-300'} /> : status === 'coming_soon' ? <Clock className={settings.status === status ? 'text-yellow-600' : 'text-gray-300'} /> : <XCircle className={settings.status === status ? 'text-red-600' : 'text-gray-300'} />}
                    <div>
                      <h3 className="font-bold capitalize">{status.replace('_', ' ')}</h3>
                      <p className="text-xs text-gray-500">{status === 'open' ? 'Accepting applications and PIN purchases.' : status === 'coming_soon' ? 'Displaying countdown/teaser.' : 'Portal fully offline.'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AGENT MANAGEMENT */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="text-blue-600" /> Agents</h2>
            <form onSubmit={generateAgentCode} className="space-y-3 mb-6">
              <input required placeholder="Agent Name" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} className="w-full p-2 text-sm border rounded outline-none" />
              <input required placeholder="Phone Number" value={newAgentPhone} onChange={e => setNewAgentPhone(e.target.value)} className="w-full p-2 text-sm border rounded outline-none" />
              <button disabled={isActionLoading} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Generate CRF
              </button>
            </form>
            <div className="space-y-3">
              {currentAgents.map((agent, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg border text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold">{agent.name}</span>
                    <button onClick={() => copyToClipboard(agent.code)} className="text-blue-600"><Copy size={14} /></button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <code className="text-xs font-bold text-blue-700">{agent.code}</code>
                    <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{agent.uses} Uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* APPLICANT TRACKING */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="text-blue-600" /> Applicant Tracking</h2>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Search CUL PIN, Name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold border-b">
                  <th className="p-4">Name</th>
                  <th className="p-4">Program</th>
                  <th className="p-4">Admission PIN</th>
                  <th className="p-4">Referral</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {currentApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{app.name}</td>
                    <td className="p-4">{app.program}</td>
                    <td className="p-4"><code className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{app.pin}</code></td>
                    <td className="p-4 text-xs">{app.refCode}</td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;