import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, Save,
  ShieldCheck, Printer as PrinterIcon, 
  ZoomIn, ZoomOut 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

interface Applicant {
  name: string;
  biodata?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    jambRegNo?: string;
    academicScore?: string;
    sponsorName?: string;
  };
}

const AdmissionEditor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pin = searchParams.get('pin');
  const formRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Applicant | null>(null);
  
  // Mobile Scaling State
  const [scale, setScale] = useState(1);

  const [editFields, setEditFields] = useState({
    middleName: '',
    jambRegNo: '',
    jambScore: '',
    sponsorName: '',
  });

  // Auto-scale for mobile on load
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 800) {
        setScale(width / 850); // Shrink to fit screen
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!pin) { navigate('/biodata'); return; }
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/biodata/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: pin.toUpperCase() })
        });
        const data = await res.json();
        if (!res.ok) throw new Error();
        setFormData(data);
        setEditFields({
          middleName: data.biodata?.middleName || '',
          jambRegNo: data.biodata?.jambRegNo || '',
          jambScore: data.biodata?.academicScore || '',
          sponsorName: data.biodata?.sponsorName || '',
        });
        setIsLoading(false);
      } catch (err) { navigate('/biodata'); }
    };
    loadData();
  }, [pin, navigate]);

  const handleExport = async () => {
    if (!formRef.current) return;
    setIsExporting(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Reset scale to 1 for high-quality export
    const originalScale = scale;
    setScale(1); 
    await new Promise(r => setTimeout(r, 100));

    try {
      for (const p of [1, 3]) {
        setCurrentPage(p);
        await new Promise(r => setTimeout(r, 800)); // Wait for image load
        const canvas = await html2canvas(formRef.current, { scale: 2, useCORS: true });
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 210, 297);
        if (p === 1) pdf.addPage();
      }
      pdf.save(`Caleb_Form_${pin}.pdf`);
    } finally {
      setIsExporting(false);
      setScale(originalScale);
      setCurrentPage(1);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center pb-20">
      
      {/* TOOLBAR - Optimized for Mobile */}
      <div className="w-full max-w-[950px] bg-slate-900 text-white p-3 sticky top-0 z-50 flex flex-wrap justify-between items-center gap-2 shadow-xl">
        <div className="flex items-center gap-2">
          <Link to="/biodata" className="p-2 hover:bg-slate-700 rounded-full"><ArrowLeft className="w-4 h-4" /></Link>
          <span className="text-xs font-bold font-mono text-blue-400">{pin}</span>
        </div>

        <div className="flex gap-1">
          <button onClick={() => setCurrentPage(1)} className={`px-3 py-1.5 text-[10px] font-bold rounded ${currentPage === 1 ? 'bg-blue-600' : 'bg-slate-700'}`}>P1</button>
          <button onClick={() => setCurrentPage(3)} className={`px-3 py-1.5 text-[10px] font-bold rounded ${currentPage === 3 ? 'bg-blue-600' : 'bg-slate-700'}`}>P3</button>
          <button onClick={handleExport} disabled={isExporting} className="bg-green-600 px-3 py-1.5 text-[10px] font-bold rounded flex items-center gap-1">
            <PrinterIcon className="w-3 h-3" /> {isExporting ? '...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* THE SCALABLE CANVAS CONTAINER */}
      <div className="mt-4 md:mt-10 overflow-auto w-full flex justify-center px-2">
        <div 
          ref={formRef} 
          className="relative bg-white shadow-2xl origin-top transition-transform"
          style={{ 
            width: '794px', 
            height: '1123px', 
            transform: `scale(${scale})`,
            marginBottom: `-${1123 * (1 - scale)}px` // Prevents huge empty space below scaled item
          }}
        >
          {/* IMAGE PATH CHECK: Ensure this folder/file exists in /public */}
          <img 
            src={`/forms/page${currentPage}.jpg`} 
            className="absolute inset-0 w-full h-full object-contain" 
            alt="Admission Form Template"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/794x1123?text=Image+Missing+Check+Public+Folder")} 
          />
          
          {currentPage === 1 ? (
            <div className="absolute inset-0">
               <div className="absolute top-[6.4%] left-[75%] font-black text-blue-900 text-xl">{pin}</div>
               <input name="jambRegNo" value={editFields.jambRegNo} onChange={(e) => setEditFields({...editFields, jambRegNo: e.target.value})} className="absolute top-[35.5%] left-[21%] w-[25%] bg-transparent border-none outline-none font-bold text-sm" title="Jamb Reg" />
               <div className="absolute top-[42.2%] left-[17%] font-bold text-sm uppercase">{formData?.biodata?.lastName}</div>
               <div className="absolute top-[47.6%] left-[17%] font-bold text-sm uppercase">{formData?.biodata?.firstName}</div>
               <input name="middleName" value={editFields.middleName} onChange={(e) => setEditFields({...editFields, middleName: e.target.value})} className="absolute top-[53.0%] left-[17%] w-[35%] bg-transparent border-none outline-none font-bold text-sm uppercase" title="Middle Name" />
            </div>
          ) : (
            <div className="absolute inset-0">
               <input name="sponsorName" value={editFields.sponsorName} onChange={(e) => setEditFields({...editFields, sponsorName: e.target.value})} className="absolute top-[10.5%] left-[10%] w-[80%] bg-transparent border-none outline-none font-bold text-sm" title="Sponsor" />
               <div className="absolute bottom-[14.5%] left-[25%] font-bold text-sm uppercase">{formData?.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmissionEditor;