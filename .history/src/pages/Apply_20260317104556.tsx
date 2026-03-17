import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, BookOpen, 
  CreditCard, CheckCircle, ShieldCheck, Copy,
  Tag, ChevronDown,
} from 'lucide-react';

const Apply = () => {
    // Load settings to know which programs are open
  const [settings] = useState(() => {
    const saved = localStorage.getItem('portal_settings');
    return saved ? JSON.parse(saved) : { programs: { ug: true, pg: true, jupeb: true } };
  });

  // Automatically select the first open program as the default
  const getFirstAvailableProgram = () => {
    if (settings.programs.ug) return 'Undergraduate Studies';
    if (settings.programs.pg) return 'Postgraduate Studies';
    if (settings.programs.jupeb) return 'JUPEB / Pre-Degree';
    return '';
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPin, setGeneratedPin] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    program: getFirstAvailableProgram(),
    referenceNumber: '',
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate network request for payment processing
    setTimeout(() => {
      // Generate a random PIN format: CUB-2026-XXXXX
      const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
      setGeneratedPin(`CUB-2026-${randomString}`);
      setIsProcessing(false);
      setStep(3);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPin);
    alert('PIN copied to clipboard!');
  };

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
          
          {/* Progress Indicator - Scaled for mobile */}
          <div className="flex items-center justify-center mb-6 md:mb-8">
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`h-1 w-8 md:w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`h-1 w-8 md:w-12 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mx-auto">
            
            {/* STEP 1: Applicant Details */}
            {step === 1 && (
              <div className="p-5 md:p-8">
                <div className="mb-5 md:mb-6">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Applicant Details</h1>
                  <p className="text-xs md:text-sm text-gray-500">Please enter your exact details as they appear on your credentials.</p>
                </div>

                <form onSubmit={handleProceedToPayment} className="space-y-4 md:space-y-5">
                    {/* Full Name Input */}
                    <div>
                        <label htmlFor="fullName" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <div className="relative">
                        <User className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3 md:top-2.5 text-gray-400" aria-hidden="true" />
                        <input 
                            id="fullName"
                            type="text" 
                            name="fullName" 
                            required 
                            value={formData.fullName} 
                            onChange={handleInputChange} 
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
                            id="email"
                            type="email" 
                            name="email" 
                            required 
                            value={formData.email} 
                            onChange={handleInputChange} 
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
                            id="phone"
                            type="tel" 
                            name="phone" 
                            required 
                            value={formData.phone} 
                            onChange={handleInputChange} 
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
                            id="referenceNumber" 
                            type="text" 
                            name="referenceNumber" 
                            value={formData.referenceNumber} 
                            onChange={handleInputChange} 
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                            placeholder="e.g. CRF-1234" 
                        />
                        </div>
                    </div>

                    {/* Programme Select */}
                    <div>
                        <label htmlFor="program" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Programme Type</label>
                        <div className="relative">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3 md:top-2.5 text-gray-400" aria-hidden="true" />
                        <select 
                            id="program"
                            name="program" 
                            value={formData.program} 
                            onChange={handleInputChange} 
                            className="w-full pl-9 md:pl-10 pr-8 md:pr-10 py-2.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            {settings.programs.ug && <option value="Undergraduate Studies">Undergraduate Studies</option>}
                            {settings.programs.pg && <option value="Postgraduate Studies">Postgraduate Studies</option>}
                            {settings.programs.jupeb && <option value="JUPEB / Pre-Degree">JUPEB / Pre-Degree</option>}
                        </select>
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 absolute right-3 top-3 md:top-2.5 text-gray-500 pointer-events-none" aria-hidden="true" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 md:py-3.5 rounded-lg hover:bg-blue-700 transition-colors mt-2 md:mt-4 shadow-md text-sm md:text-base">
                        Proceed to Payment
                    </button>
                    </form>
              </div>
            )}

            {/* STEP 2: Payment Mockup */}
            {step === 2 && (
              <div className="p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Application Fee</h1>
                  <p className="text-xs md:text-sm text-gray-500">Complete your payment to generate your PIN.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 md:p-5 mb-5 md:mb-6 border border-gray-100">
                  <div className="flex justify-between text-xs md:text-sm mb-3">
                    <span className="text-gray-500">Applicant:</span>
                    <span className="font-semibold text-gray-900 text-right">{formData.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm mb-3">
                    <span className="text-gray-500">Programme:</span>
                    <span className="font-semibold text-gray-900 text-right">{formData.program}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-700 mt-1">Total Amount:</span>
                    <span className="font-black text-blue-600 text-lg md:text-xl">₦10,000.00</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="w-full bg-[#0A192F] text-white font-bold py-3 md:py-3.5 rounded-lg hover:bg-black transition-colors shadow-md flex justify-center items-center text-sm md:text-base"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      'Pay with Card / Transfer'
                    )}
                  </button>
                  <button onClick={() => setStep(1)} className="w-full bg-white text-gray-600 font-bold py-3 md:py-3.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm md:text-base">
                    Cancel & Go Back
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Success & PIN Generated */}
            {step === 3 && (
              <div className="p-5 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1 md:mb-2">Payment Successful!</h1>
                <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8">Your application fee has been received.</p>

                <div className="bg-blue-50 rounded-xl p-4 md:p-6 border-2 border-blue-100 mb-6 md:mb-8 mx-1">
                  <p className="text-[10px] md:text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Your Application PIN</p>
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-blue-900 tracking-wider">
                      {generatedPin}
                    </span>
                    <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-800 transition p-1" title="Copy PIN">
                      <Copy className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                  <p className="text-[10px] md:text-xs text-blue-600 mt-3 md:mt-4 font-medium px-2">
                    Please copy this PIN. You need it to log in and complete your main biodata form.
                  </p>
                </div>

                <div className="space-y-3">
                  <Link to="/biodata" className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 md:py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm md:text-base">
                    Proceed to Biodata <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                  </Link>
                  <Link to="/" className="inline-block w-full bg-white text-gray-600 font-bold py-3 md:py-3.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm md:text-base">
                    Return to Homepage
                  </Link>
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