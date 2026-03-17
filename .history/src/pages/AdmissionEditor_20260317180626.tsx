import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, Save,
  ChevronRight, ShieldCheck, PrinterIcon 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

// --- TYPE DEFINITION (Replaces 'any') ---
interface Applicant {
  name: string;
  email: string;
  program: string;
  status: string;
  biodata?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    jambRegNo?: string;
    academicScore?: string;
    sponsorName?: string;
    sponsorAddress?: string;
    [key: string]: string | undefined; 
  };
}

const AdmissionEditor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pin = searchParams.get('pin');
  const formRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [formData, setFormData] = useState<Applicant | null>(null);
  const [editFields, setEditFields] = useState({
    middleName: '',
    jambRegNo: '',
    jambScore: '',
    session: '2026/2027',
    sponsorName: '',
    sponsorAddress: '',
  });

  useEffect(() => {
    if (!pin) {
      navigate('/biodata', { replace: true });
      return;
    }

    const verifyAndLoad = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/biodata/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: pin.toUpperCase() })
        });

        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();

        if (data.status !== 'completed' && data.status !== 'ongoing') {
          navigate('/biodata', { replace: true });
          return;
        }

        setFormData(data);
        setEditFields(prev => ({
          ...prev,
          ...data.biodata,
          middleName: data.biodata?.middleName || '',
          jambScore: data.biodata?.academicScore || '', // Map DB field to local state
        }));
        setIsAuthorized(true);
      } catch (err) {
        console.error(err);
        navigate('/biodata', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndLoad();
  }, [pin, navigate]);

  // --- HANDLERS ---
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  // Saves edits made on the PDF back to the Database
  const handleSyncData = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/biodata/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pin: pin?.toUpperCase(), 
          biodata: {
            ...formData?.biodata,
            ...editFields,
            academicScore: editFields.jambScore // Sync back to the database field name
          } 
        })
      });
      if (!response.ok) throw new Error("Sync failed");
      alert("Changes saved to official record!");
    } catch (err) {
        console.error(err);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!formRef.current) return;
    setIsExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pagesToExport = [1, 3]; 

      for (let i = 0; i < pagesToExport.length; i++) {
        setCurrentPage(pagesToExport[i]);
        await new Promise(r => setTimeout(r, 450)); 

        const canvas = await html2canvas(formRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        if (i < pagesToExport.length - 1) pdf.addPage();
      }

      pdf.save(`Caleb_Admission_${pin}.pdf`);
    } catch (error) {
        console.error("Export Error:", error);
        alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setCurrentPage(1);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">SECURING ACCESS...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center pb-20">
      
      {/* TOOLBAR */}
      <div className="w-full max-w-[950px] bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-2xl border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Link to="/biodata" aria-label="Go back to biodata" className="p-2 hover:bg-slate-800 rounded-full transition"><ArrowLeft className="w-5 h-5" /></Link>
          <h2 className="font-bold text-sm hidden md:block">Admission Form Editor</h2>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Page Switcher */}
          <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
            <button onClick={() => setCurrentPage(1)} className={`px-3 md:px-4 py-1.5 rounded-md text-xs font-bold ${currentPage === 1 ? 'bg-blue-600' : ''}`}>Page 1</button>
            <button onClick={() => setCurrentPage(3)} className={`px-3 md:px-4 py-1.5 rounded-md text-xs font-bold ${currentPage === 3 ? 'bg-blue-600' : ''}`}>Page 3</button>
          </div>

          {/* Sync Button */}
          <button 
            onClick={handleSyncData} 
            disabled={isSaving || isExporting} 
            title="Save changes to database"
            className="bg-slate-700 hover:bg-slate-600 p-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 font-bold text-xs transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save Edits'}</span>
          </button>

          {/* Export Button */}
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting || isSaving} 
            className="bg-green-600 hover:bg-green-700 p-2 md:px-5 md:py-2 rounded-lg flex items-center gap-2 font-black text-xs uppercase transition disabled:opacity-50 shadow-lg"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PrinterIcon className="w-4 h-4" />}
            <span className="hidden md:inline">{isExporting ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* FORM CANVAS */}
      <div 
        ref={formRef}
        className="mt-10 relative bg-white shadow-2xl"
        style={{ width: '800px', height: '1131px', minWidth: '800px' }}
      >
        <img 
          src={`/forms/page${currentPage}.jpg`} 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
          alt={`Form Page ${currentPage}`} 
        />

        {/* --- PAGE 1 OVERLAYS --- */}
        {currentPage === 1 && (
          <div className="absolute inset-0">
            <div className="absolute top-[6.4%] left-[75%] font-mono font-black text-blue-800 text-xl tracking-tighter">{pin}</div>
            
            <input 
              name="jambRegNo" value={editFields.jambRegNo} onChange={handleInput} 
              title="JAMB Registration Number" aria-label="JAMB Registration Number" placeholder="REG NUMBER"
              className="absolute top-[35.5%] left-[21%] w-[25%] bg-transparent border-none outline-none font-bold text-sm" 
            />
            <input 
              name="jambScore" value={editFields.jambScore} onChange={handleInput} 
              title="JAMB Score" aria-label="JAMB Score" placeholder="000"
              className="absolute top-[37.4%] left-[21%] w-[10%] bg-transparent border-none outline-none font-bold text-sm" 
            />

            <div className="absolute top-[42.2%] left-[17%] font-bold text-sm uppercase">{(formData?.biodata?.lastName || '').toUpperCase()}</div>
            <div className="absolute top-[47.6%] left-[17%] font-bold text-sm uppercase">{(formData?.biodata?.firstName || '').toUpperCase()}</div>
            
            <input 
              name="middleName" value={editFields.middleName} onChange={handleInput} 
              title="Middle Name" aria-label="Middle Name" placeholder="MIDDLE NAME"
              className="absolute top-[53.0%] left-[17%] w-[35%] bg-transparent border-none outline-none font-bold text-sm uppercase" 
            />
          </div>
        )}

        {/* --- PAGE 3 OVERLAYS --- */}
        {currentPage === 3 && (
          <div className="absolute inset-0">
            <input 
              name="sponsorName" value={editFields.sponsorName} onChange={handleInput} 
              title="Sponsor Name" aria-label="Sponsor Name" placeholder="NAME OF SPONSOR"
              className="absolute top-[10.5%] left-[10%] w-[80%] bg-transparent border-none outline-none font-bold text-sm" 
            />
            
            <div className="absolute bottom-[14.5%] left-[25%] font-bold text-sm uppercase">{(formData?.name || '').toUpperCase()}</div>
            <div className="absolute bottom-[13%] left-[25%] font-mono text-[10px] text-gray-400 italic">Digitally Signed via {pin}</div>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="max-w-[800px] w-full mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-500 w-5 h-5" />
          <p className="text-slate-400 text-xs">Official Secure Review Session • {pin}</p>
        </div>
        <div className="flex items-center gap-1 text-blue-400 text-xs font-bold">
          Reviewing Page {currentPage} <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default AdmissionEditor;