import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Printer, CheckCircle, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

const DownloadForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pin = searchParams.get('pin');
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pin) navigate('/biodata');
  }, [pin, navigate]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/biodata/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin?.toUpperCase() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate PDF");

      // Trigger the download of the actual edited PDF
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${data.pdf}`;
      link.download = `Caleb_Admission_${pin}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-green-500">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Locked</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your biodata for PIN <strong className="font-mono text-blue-600">{pin}</strong> has been processed successfully.
        </p>

        {error && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}

        <button 
          onClick={handleDownload} 
          disabled={isDownloading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mb-4 shadow-md"
        >
          {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
          {isDownloading ? 'Generating Official Form...' : 'Download Admission Form'}
        </button>

        <Link to="/" className="text-gray-500 font-bold hover:text-gray-900 flex items-center justify-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default DownloadForm;