import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, Printer, ArrowLeft, ChevronLeft, 
  ChevronRight, Save, ShieldCheck, AlertCircle 
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
    // Page 1
    middleName: '',
    jambRegNo: '',
    jambScore: '',
    session: '2026/2027',
    // Page 2
    dateOfBirth: '',
    gender: '',
    stateOfOrigin: '',
    nationality: 'Nigerian',
    religion: '',
    preferredCourse: '',
    // Page 3
    sponsorName: '',
    sponsorAddress: '',
  });

  // --- SECURITY & DATA FETCH ---
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

        // Only allow completed applications to enter the editor
        if (data.status !== 'completed' && data.status !== 'ongoing') {
          navigate('/biodata', { replace: true });
          return;
        }

        setFormData(data);
        // Pre-fill fields from database
        setEditFields(prev => ({
          ...prev,
          ...data.biodata,
          middleName: data.biodata?.middleName || '',
        }));
        setIsAuthorized(true);
      } catch (err) {
        navigate('/biodata', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndLoad();
  }, [pin, navigate]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  // --- PRINT ENGINE ---
  const handleExportPDF = async () => {
    if (!formRef.current) return;
    setIsExporting(true);

    try {
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = [1, 2, 3];

      for (let i = 0; i < pages.length; i++) {
        setCurrentPage(pages[i]);
        // Wait for React to render the new page
        await new Promise(r => setTimeout(r, 300));

        const canvas = await html2canvas(formRef.current, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        if (i < pages.length - 1) pdf.addPage();
      }

      pdf.save(`Caleb_Admission_${pin}.pdf`);
    } catch (error) {
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setCurrentPage(1); // Reset to first page
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold animate-pulse">SECURING ACCESS...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center pb-20">
      
      {/* TOOLBAR */}
      <div className="w-full max-w-[900px] bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-2xl border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Link to="/biodata" className="p-2 hover:bg-slate-800 rounded-full transition"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h2 className="font-bold text-sm leading-none">Official Form Editor</h2>
            <p className="text-[10px] text-blue-400 font-mono mt-1">{pin}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
            {[1, 2, 3].map(num => (
              <button 
                key={num} 
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${currentPage === num ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              >
                Page {num}
              </button>
            ))}
          </div>

          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg flex items-center gap-2 font-black text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            {isExporting ? 'Processing...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* FORM CANVAS */}
      <div 
        ref={formRef}
        className="mt-10 relative bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all"
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
            {/* PIN */}
            <div className="absolute top-[6.4%] left-[75%] font-mono font-black text-blue-800 text-xl tracking-tighter">{pin}</div>
            
            {/* JAMB Details */}
            <input name="jambRegNo" value={editFields.jambRegNo} onChange={handleInput} className="absolute top-[35.5%] left-[21%] w-[25%] bg-transparent border-none outline-none font-bold text-sm" />
            <input name="jambScore" value={editFields.jambScore} onChange={handleInput} className="absolute top-[37.4%] left-[21%] w-[10%] bg-transparent border-none outline-none font-bold text-sm" />

            {/* Names */}
            <div className="absolute top-[42.2%] left-[17%] font-bold text-sm uppercase">{(formData?.lastName || '').toUpperCase()}</div>
            <div className="absolute top-[47.6%] left-[17%] font-bold text-sm uppercase">{(formData?.firstName || '').toUpperCase()}</div>
            <input name="middleName" value={editFields.middleName} onChange={handleInput} className="absolute top-[53.0%] left-[17%] w-[35%] bg-transparent border-none outline-none font-bold text-sm uppercase" placeholder="MIDDLE NAME" />
          </div>
        )}

        {/* --- PAGE 2 OVERLAYS --- */}
        {currentPage === 2 && (
          <div className="absolute inset-0">
            {/* SEX CHECKBOXES (Logic: If Male, show X in Male box) */}
            <div className="absolute top-[8.5%] left-[18.2%] font-bold text-lg">{editFields.gender === 'Male' ? 'X' : ''}</div>
            <div className="absolute top-[8.5%] left-[26.4%] font-bold text-lg">{editFields.gender === 'Female' ? 'X' : ''}</div>

            <input name="stateOfOrigin" value={editFields.stateOfOrigin} onChange={handleInput} className="absolute top-[13.7%] left-[25%] w-[35%] bg-transparent border-none outline-none font-bold text-sm" />
            <input name="religion" value={editFields.religion} onChange={handleInput} className="absolute top-[18.5%] left-[25%] w-[35%] bg-transparent border-none outline-none font-bold text-sm" />
          </div>
        )}

        {/* --- PAGE 3 OVERLAYS --- */}
        {currentPage === 3 && (
          <div className="absolute inset-0">
            <input name="sponsorName" value={editFields.sponsorName} onChange={handleInput} className="absolute top-[10.5%] left-[10%] w-[80%] bg-transparent border-none outline-none font-bold text-sm" />
            
            {/* Signature Area Placeholder */}
            <div className="absolute bottom-[14.5%] left-[25%] font-bold text-sm uppercase">{(formData?.name || '').toUpperCase()}</div>
          </div>
        )}
      </div>

      <div className="max-w-[800px] w-full mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
        <ShieldCheck className="text-green-500 w-5 h-5" />
        <p className="text-slate-400 text-xs">
          This document is generated based on your verified payment and biodata. All entries are legally binding under Caleb University statutes[cite: 120].
        </p>
      </div>
    </div>
  );
};

export default AdmissionEditor;