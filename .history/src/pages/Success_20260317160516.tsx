import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, ArrowLeft, Loader2, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

const Success = () => {
  const [searchParams] = useSearchParams();
  const paymentReference = searchParams.get('paymentReference');
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [pinData, setPinData] = useState<{ pin: string; name: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentReference) {
      navigate('/', { replace: true });
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pay/verify?ref=${paymentReference}`);
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Payment verification failed.");
        }
        
        const data = await res.json();
        setPinData({ pin: data.pin, name: data.name });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to verify payment.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      verifyPayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, [paymentReference, navigate]);

  const copyToClipboard = () => {
    if (pinData?.pin) {
      navigator.clipboard.writeText(pinData.pin);
      alert('PIN copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Verifying Payment...</h2>
        <p className="text-xs md:text-sm text-gray-500 mt-2 text-center">Please wait while we securely fetch your Application PIN.</p>
      </div>
    );
  }

  if (error || !pinData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <XCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-xs md:text-sm text-gray-600 mb-5">{error}</p>
          <p className="text-[10px] md:text-xs text-gray-400 mb-6">
            If you have been debited, do not pay again. Your PIN will be sent to your email once the network confirms the transfer.
          </p>
          <Link to="/" className="inline-block bg-gray-900 text-white text-sm font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors w-full">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
      <div className="bg-white p-5 md:p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-green-500">
        <div className="w-14 h-14 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
        </div>
        
        <h1 className="text-lg md:text-2xl font-extrabold text-gray-900 mb-1">Payment Successful!</h1>
        <p className="text-xs md:text-sm text-gray-500 mb-5 md:mb-8 px-2">Welcome, <span className="font-bold">{pinData.name}</span>. Your application fee has been received.</p>

        {/* REMOVED THE BLUE BORDER HERE */}
        <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          <p className="text-[9px] md:text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Your Application PIN</p>
          
          <div className="flex items-center justify-between gap-2 bg-white py-2.5 px-3 md:py-3 md:px-4 rounded-lg shadow-inner overflow-hidden">
            <span className="text-base sm:text-lg md:text-2xl font-black text-blue-900 tracking-normal md:tracking-widest font-mono truncate">
              {pinData.pin}
            </span>
            <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-800 transition p-1.5 md:p-2 bg-blue-50 rounded-md shrink-0" title="Copy PIN">
              <Copy className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          
          <p className="text-[9px] md:text-xs text-blue-600 mt-3 md:mt-4 font-medium leading-tight">
            ⚠️ Please copy and save this PIN immediately. You need it to log in and complete your biodata form.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/biodata" className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 md:py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-xs md:text-sm">
            Proceed to Biodata <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 rotate-180" />
          </Link>
          <Link to="/" className="inline-block w-full bg-white text-gray-600 font-bold py-3 md:py-3.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs md:text-sm">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;