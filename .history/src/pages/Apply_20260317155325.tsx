import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, BookOpen, 
  CreditCard, ShieldCheck, Tag, ChevronDown, Loader2
} from 'lucide-react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

// --- FEE CALCULATIONS ---
const BASE_AMOUNT = 10000;
const PROCESSING_FEE = (BASE_AMOUNT * 0.015) + 100; // 1.5% + 100 Naira
const TOTAL_AMOUNT = BASE_AMOUNT + PROCESSING_FEE;

const Apply = () => {
  // --- STATE ---
  const [settings, setSettings] = useState<{ programs: { ug: boolean; pg: boolean; jupeb: boolean; } } | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    program: '',
    referenceNumber: '',
  });

  // --- FETCH OPEN PROGRAMS ---
  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        // Auto-select the first available program
        if (data.programs.ug) setFormData(prev => ({ ...prev, program: 'Undergraduate' }));
        else if (data.programs.pg) setFormData(prev => ({ ...prev, program: 'Postgraduate' }));
        else if (data.programs.jupeb) setFormData(prev => ({ ...prev, program: 'JUPEB' }));
      })
      .catch(err => console.error("Failed to load programs:", err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // --- INITIATE MONNIFY PAYMENT ---
  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/pay/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: BASE_AMOUNT, // Backend calculates the fee, but we send the base
          customerName: formData.fullName,
          customerEmail: formData.email,
          program: formData.program,
          refCode: formData.referenceNumber || 'DIRECT',
          redirectUrl: `${window.location.origin}/success`
        })
      });

      if (!response.ok) throw new Error("Failed to initialize payment. Please try again.");

      const data = await response.json();
      
      // REDIRECT TO MONNIFY CHECKOUT URL!
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Invalid response from payment gateway.");
      }

    } catch (error) {
      console.error(error);
      // Check if it's a real Error object before reading .message
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
      setIsProcessing(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col overflow-x-hidden">
      
      {/* Responsive Header */}
      <header className="bg-white border-b border-gray-200 py-3 md:py-4 px-4 md:px-6 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 text-gray-500 hover:text-blue-700 transition font-medium text-xs md:text-sm">
          <ArrowLeft className="w-4 h-4" /> 
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="h-6 md:h-8 overflow-hidden flex justify-center">
          <img src="/images/cul_logo_rect.png" alt="Caleb Logo" className="h-full w-auto object-contain" />
        </div>
        <div className="w-16 md:w-24 text-right">
          <span className="flex items-center justify-end gap-1 text-[10px] md:text-xs font-bold text-green-600">
            <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" /> Secure
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-lg">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6 md:mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mx-auto">
            
            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 text-sm text-center font-bold border-b border-red-100">
                {errorMessage}
              </div>
            )}
            
            {/* STEP 1: Applicant Details */}
            {step === 1 && (
              <div className="p-5 md:p-8">
                <div className="mb-5 md:mb-6">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Applicant Details</h1>
                  <p className="text-xs md:text-sm text-gray-500">Please enter your exact details as they appear on your credentials.</p>
                </div>

                <form onSubmit={handleProceedToConfirmation} className="space-y-4 md:space-y-5">
                    {/* Full Name Input */}
                    <div>
                        <label htmlFor="fullName" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <div className="relative">
                        <User className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3 md:top-2.5 text-gray-400" aria-hidden="true" />
                        <input 
                            id="fullName" type="text" name="fullName" required 
                            value={formData.fullName} onChange={handleInputChange} 
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                            placeholder="Surname First" 
                        />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <div className="relative">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3 md:top-2.5 text-gray-400" aria-hidden="true" />
                        <input 
                            id="email" type="email" name="email" required 
                            value={formData.email} onChange={handleInputChange} 
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                            placeholder="applicant@email.com" 
                        />
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label htmlFor="phone" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                        <div className="relative">
                        <Phone className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3 md:top-2.5 text-gray-400" aria-hidden="true" />
                        <input 
                            id="phone" type="tel" name="phone" required 
                            value={formData.phone} onChange={handleInputChange} 
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                            placeholder="080XXXXXXXX" 
                        />
                        </div>
                    </div>

                    {/* Optional Reference Number */}
                    <div>
                        <label htmlFor="referenceNumber" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                        Agent / Ref Number <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                        <Tag className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3 md:top-2.5 text-gray-400" aria-hidden="true" />
                        <input 
                            id="referenceNumber" type="text" name="referenceNumber" 
                            value={formData.referenceNumber} onChange={handleInputChange} 
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase" 
                            placeholder="e.g. CRF-1234" 
                        />
                        </div>
                    </div>

                    {/* Programme Select (Dynamic) */}
                    <div>
                        <label htmlFor="program" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Programme Type</label>
                        <div className="relative">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3 md:top-2.5 text-gray-400" aria-hidden="true" />
                        <select 
                            id="program" name="program" value={formData.program} onChange={handleInputChange} 
                            className="w-full pl-9 md:pl-10 pr-8 md:pr-10 py-2.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            {settings.programs.ug && <option value="Undergraduate">Undergraduate Studies</option>}
                            {settings.programs.pg && <option value="Postgraduate">Postgraduate Studies</option>}
                            {settings.programs.jupeb && <option value="JUPEB">JUPEB / Pre-Degree</option>}
                        </select>
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 absolute right-3 top-3 md:top-2.5 text-gray-500 pointer-events-none" aria-hidden="true" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 md:py-3.5 rounded-lg hover:bg-blue-700 transition-colors mt-2 md:mt-4 shadow-md text-sm md:text-base">
                        Review Details
                    </button>
                  </form>
              </div>
            )}

            {/* STEP 2: Confirmation & Breakdown */}
            {step === 2 && (
              <div className="p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Confirm Payment</h1>
                  <p className="text-xs md:text-sm text-gray-500">You will be redirected to Monnify to complete your bank transfer safely.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 md:p-5 mb-5 md:mb-6 border border-gray-200">
                  <div className="flex justify-between text-xs md:text-sm mb-3">
                    <span className="text-gray-500">Applicant:</span>
                    <span className="font-bold text-gray-900 text-right">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm mb-3">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-bold text-gray-900 text-right">{formData.email}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm mb-4 pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Programme:</span>
                    <span className="font-bold text-gray-900 text-right">{formData.program}</span>
                  </div>
                  
                  {/* Fee Breakdown */}
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span className="text-gray-600 font-medium">Application Form:</span>
                    <span className="font-semibold text-gray-800 text-right">₦{BASE_AMOUNT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm mb-4">
                    <span className="text-gray-600 font-medium">Processing Fee:</span>
                    <span className="font-semibold text-gray-800 text-right">₦{PROCESSING_FEE.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm md:text-base pt-3 border-t border-gray-300">
                    <span className="font-bold text-gray-700 mt-1">Total to Pay:</span>
                    <span className="font-black text-blue-700 text-xl md:text-2xl">₦{TOTAL_AMOUNT.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="w-full bg-[#0A192F] text-white font-bold py-3 md:py-4 rounded-lg hover:bg-black transition-colors shadow-md flex justify-center items-center gap-2 text-sm md:text-base disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating Secure Link...</>
                    ) : (
                      <><ShieldCheck className="w-5 h-5" /> Proceed to Monnify</>
                    )}
                  </button>
                  <button onClick={() => setStep(1)} disabled={isProcessing} className="w-full bg-white text-gray-600 font-bold py-3 md:py-3.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm md:text-base disabled:opacity-50">
                    Edit Details
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Apply;