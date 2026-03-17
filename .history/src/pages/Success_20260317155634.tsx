import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, ArrowLeft, Loader2, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

const Success = () => {
  const [searchParams] = useSearchParams();
  const paymentReference = searchParams.get('paymentReference');
  const navigate = useNavigate(); // Added for the security kick-out

  const [isLoading, setIsLoading] = useState(true);
  const [pinData, setPinData] = useState<{ pin: string; name: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // SECURITY CHECK: If someone just types /success, kick them back to home instantly
    if (!paymentReference) {
      navigate('/', { replace: true });
      return;
    }

    // Ping the backend to check if the Webhook has processed the payment
    const verifyPayment = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pay/verify?ref=${paymentReference}`);
        
        // If the backend says no payment exists, it throws an error
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Payment verification failed.");
        }
        
        // If legitimate, display the PIN
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

    // Give Monnify's webhook a 2-second head start to update Firebase before we check
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

  // --- 1. LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Verifying Payment...</h2>
        <p className="text-sm text-gray-500 mt-2 text-center">Please wait while we securely fetch your Application PIN.</p>
      </div>
    );
  }

  // --- 2. HACKER / FAILED PAYMENT STATE ---
  if (error || !pinData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <p className="text-xs text-gray-400 mb-6">
            If you have been debited, do not pay again. Your PIN will be sent to your email once the network confirms the transfer.
          </p>
          <Link to="/" className="inline-block bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors w-full">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // --- 3. LEGITIMATE SUCCESS STATE ---
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-green-500">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
        </div>
        
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1 md:mb-2">Payment Successful!</h1>
        <p className="text-sm text-gray-500 mb-6 md:mb-8">Welcome, <span className="font-bold">{pinData.name}</span>. Your application fee has been received.</p>

        <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-blue-100">
          <p className="text-[10px] md:text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Your Application PIN</p>
          
          <div className="flex items-center justify-center gap-2 md:gap-3 bg-white py-3 px-4 rounded-lg shadow-inner">
            <span className="text-xl sm:text-2xl font-black text-blue-900 tracking-wider font-mono">
              {pinData.pin}
            </span>
            <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-800 transition p-2 bg-blue-50 rounded-md" title="Copy PIN">
              <Copy className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          
          <p className="text-[10px] md:text-xs text-blue-600 mt-4 font-medium">
            ⚠️ Please copy and save this PIN immediately. You need it to log in and complete your biodata form.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/biodata" className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm">
            Proceed to Biodata <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
          <Link to="/" className="inline-block w-full bg-white text-gray-600 font-bold py-3.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;