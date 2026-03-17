import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, Key, Save, Send, User, BookOpen, 
  Phone, MapPin, CheckCircle, ArrowLeft, AlertCircle, Loader2 
} from 'lucide-react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

const BiodataForm = () => {
  // 1. Check if the portal is actually open
  const [isPortalOpen, setIsPortalOpen] = useState(true);

  // 2. Manage Login State
  const [pin, setPin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [isDownloading, setIsDownloading] = useState(false);
  
  // Applicant Data from Database
  const [applicantInfo, setApplicantInfo] = useState<{name: string, program: string, email: string} | null>(null);

  // 3. Form Data State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    previousSchool: '',
    academicScore: '', // Used for JAMB or Degree Class
    sponsorName: '',
    sponsorPhone: ''
  });

  useEffect(() => {
    // Check portal status on mount
    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => setIsPortalOpen(data.status === 'open'))
      .catch(() => setIsPortalOpen(true)); // Default open if error
  }, []);

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE}/api/biodata/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.toUpperCase() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate PDF");

      // Trigger actual file download
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${data.pdf}`;
      link.download = `Caleb_Admission_Form_${pin}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Could not download PDF"));
    } finally {
      setIsDownloading(false);
    }
  };

  // --- HANDLE PIN LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      // Ask the backend if this PIN exists
      const response = await fetch(`${API_BASE}/api/biodata/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.toUpperCase() })
      });

      if (!response.ok) {
        throw new Error('Invalid PIN. Please check and try again.');
      }

      const data = await response.json();

      // Check if already completed
      if (data.status === 'completed') {
        setIsSubmitted(true);
      } else {
        // Populate the form with known data from payment
        const nameParts = data.name.split(' ');
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[nameParts.length - 1] || '', // Guessing last word is first name
          lastName: nameParts[0] || '', // Guessing first word is surname
          ...data.biodata // Load any previously saved drafts from DB
        }));
      }

      setApplicantInfo({ name: data.name, program: data.program, email: data.email });
      setIsLoggedIn(true);

    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLE INPUTS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const updatedData = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedData);
  };

  // --- SAVE DRAFT (Local for now, can move to DB later) ---
  const saveDraft = () => {
    localStorage.setItem(`draft_${pin.toUpperCase()}`, JSON.stringify(formData));
    alert('Progress Saved! You can return later using your PIN.');
  };

  // --- FINAL SUBMISSION ---
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/biodata/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pin: pin.toUpperCase(),
          biodata: formData
        })
      });

      if (!response.ok) throw new Error("Failed to submit biodata.");

      localStorage.removeItem(`draft_${pin.toUpperCase()}`);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      }
      alert("Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // VIEW 1: Portal is Closed
  if (!isPortalOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center border-t-4 border-red-500">
          <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-3 md:mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Portal Closed</h1>
          <p className="text-sm md:text-base text-gray-500 mb-5 md:mb-6">The admission portal is currently not accepting biodata submissions. Please check back later.</p>
          <Link to="/" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base">
            <ArrowLeft className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  // VIEW 2: PIN Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 md:p-8 relative z-10">
          <div className="text-center mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Lock className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Biodata Portal</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Enter your Application PIN to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            <div>
              <label htmlFor="pin" className="block text-xs md:text-sm font-bold text-gray-700 mb-2">Application PIN</label>
              <div className="relative">
                <Key className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3.5 md:top-3 text-gray-400" aria-hidden="true" />
                <input 
                  id="pin"
                  type="text" 
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono tracking-widest text-base md:text-lg"
                  placeholder="CUL-2026-XXXXX" 
                />
              </div>
              {loginError && <p className="text-red-500 text-[10px] md:text-xs mt-2 font-semibold">{loginError}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 md:py-3.5 rounded-lg hover:bg-blue-700 transition shadow-md text-sm md:text-base flex justify-center items-center gap-2 disabled:opacity-70">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Portal'}
            </button>
          </form>

          <div className="mt-5 md:mt-6 text-center">
            <Link to="/" className="text-xs md:text-sm text-gray-500 hover:text-blue-600 transition flex items-center justify-center gap-1 md:gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 3: Already Submitted Success Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center border-t-4 border-green-500">
          <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-3 md:mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Application Locked</h1>
          <p className="text-sm md:text-base text-gray-600 mb-5 md:mb-6 border-b pb-5 md:pb-6">
            Your biodata for PIN <strong className="font-mono text-blue-600">{pin}</strong> has already been submitted successfully. 
            You can no longer edit this information.
          </p>
          {/* We will hook up the PDF generation to this button later! */}
          <button onClick={() => window.print()} className="w-full bg-slate-900 text-white font-bold py-2.5 md:py-3 rounded-lg hover:bg-black transition mb-3 shadow-md text-sm md:text-base">
            Print Acknowledgment Slip
          </button>
          <Link to="/" className="text-blue-600 font-bold hover:underline block text-sm md:text-base">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // VIEW 4: The Actual Biodata Form
  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10 md:pb-12 overflow-x-hidden">
      {/* Form Header */}
      <header className="bg-slate-900 text-white py-4 md:py-6 px-4 md:px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-xl font-bold">Official Biodata Form</h1>
            <p className="text-[10px] md:text-xs text-slate-400 mt-1 flex items-center gap-1.5 md:gap-2">
              <Lock className="w-3 h-3 shrink-0" /> 
              <span className="hidden sm:inline">Logged in as:</span>
              <span className="font-mono text-blue-300 tracking-wider truncate max-w-[120px] sm:max-w-none">{pin}</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={saveDraft}
            className="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition border border-slate-700"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto px-4 mt-6 md:mt-8">
        
        {/* Dynamic Banner telling them what they are applying for */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-r-lg">
          <p className="text-sm text-blue-800">
            You are currently filling out the application for: <span className="font-bold">{applicantInfo?.program}</span>
          </p>
        </div>

        <form onSubmit={handleSubmitForm} className="space-y-6 md:space-y-8">
          
          {/* Section 1: Personal Details */}
          <div className="bg-white p-5 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-5 md:mb-6 flex items-center gap-2 border-b pb-2 md:pb-3">
              <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Personal Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="firstName" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">First Name</label>
                <input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full p-2.5 md:p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Last Name (Surname)</label>
                <input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full p-2.5 md:p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Date of Birth</label>
                <input id="dateOfBirth" type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleInputChange} className="w-full p-2.5 md:p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Gender</label>
                <select id="gender" name="gender" required value={formData.gender} onChange={handleInputChange} className="w-full p-2.5 md:p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="">Select Gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Residential Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3.5 md:top-3 text-gray-400" aria-hidden="true" />
                  <input id="address" name="address" required value={formData.address} onChange={handleInputChange} className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Sponsor Details */}
          <div className="bg-white p-5 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-5 md:mb-6 flex items-center gap-2 border-b pb-2 md:pb-3">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Academic & Sponsorship
            </h2>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              
              <div className="md:col-span-2">
                <label htmlFor="previousSchool" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  {applicantInfo?.program === 'Postgraduate' ? 'Previous University Attended' : 'Last Secondary School Attended'}
                </label>
                <input id="previousSchool" name="previousSchool" required value={formData.previousSchool} onChange={handleInputChange} className="w-full p-2.5 md:p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              
              {/* DYNAMIC FIELD based on Program */}
              <div>
                <label htmlFor="academicScore" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  {applicantInfo?.program === 'Postgraduate' ? 'Degree Classification (e.g. Second Class Upper)' : 'JAMB Score (if applicable)'}
                </label>
                <input 
                  id="academicScore" 
                  name="academicScore" 
                  type={applicantInfo?.program === 'Postgraduate' ? 'text' : 'number'} 
                  value={formData.academicScore} 
                  onChange={handleInputChange} 
                  className="w-full p-2.5 md:p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>

              <div>
                <label htmlFor="sponsorName" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Sponsor Full Name</label>
                <input id="sponsorName" name="sponsorName" required value={formData.sponsorName} onChange={handleInputChange} className="w-full p-2.5 md:p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>

              <div>
                <label htmlFor="sponsorPhone" className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Sponsor Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-3.5 md:top-3 text-gray-400" aria-hidden="true" />
                  <input id="sponsorPhone" name="sponsorPhone" type="tel" required value={formData.sponsorPhone} onChange={handleInputChange} className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
            <button 
              type="button" 
              onClick={saveDraft}
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 md:py-4 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Save className="w-4 h-4 md:w-5 md:h-5" /> Save Progress
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white font-bold py-3 md:py-4 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 md:w-5 md:h-5" /> Submit Final Application</>}
            </button>
          </div>
          
        </form>
      </main>
    </div>
  );
};

export default BiodataForm;