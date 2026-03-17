import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, 
  ChevronRight, ShieldCheck, PrinterIcon 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

const AdmissionEditor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pin = searchParams.get('pin');
  const formRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [formData, setFormData] = useState<any>(null);
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleExportPDF = async () => {
    if (!formRef.current) return;
    setIsExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pagesToExport = [1, 3]; // Only Page 1 and Page 3 as requested

      for (let i = 0; i < pagesToExport.length; i++) {
        setCurrentPage(pagesToExport[i]);
        await new Promise(r => setTimeout(r, 400)); // Buffer for image swap

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
      <div className="w-full max-w-[900px] bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-2xl border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Link to="/biodata" aria-label="Go back to biodata" className="p-2 hover:bg-slate-800 rounded-full transition"><ArrowLeft className="w-5 h-5" /></Link>
          <h2 className="font-bold text-sm">Official Form Editor</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
            <button onClick={() => setCurrentPage(1)} className={`px-4 py-1.5 rounded-md text-xs font-bold ${currentPage === 1 ? 'bg-blue-600' : ''}`}>Page 1</button>
            <button onClick={() => setCurrentPage(3)} className={`px-4 py-1.5 rounded-md text-xs font-bold ${currentPage === 3 ? 'bg-blue-600' : ''}`}>Page 3</button>
          </div>

          <button onClick={handleExportPDF} disabled={isExporting} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg flex items-center gap-2 font-black text-xs uppercase transition disabled:opacity-50">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PrinterIcon className="w-4 h-4" />}
            {isExporting ? 'Generating...' : 'Export PDF'}
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

            <div className="absolute top-[42.2%] left-[17%] font-bold text-sm uppercase">{(formData?.lastName || '').toUpperCase()}</div>
            <div className="absolute top-[47.6%] left-[17%] font-bold text-sm uppercase">{(formData?.firstName || '').toUpperCase()}</div>
            
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

      <div className="max-w-[800px] w-full mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-500 w-5 h-5" />
          <p className="text-slate-400 text-xs">Official {pin} Secure Document Session</p>
        </div>
        <div className="flex items-center gap-1 text-blue-400 text-xs font-bold">
          Reviewing Page {currentPage} <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default AdmissionEditor;