import { useState} from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, Key, Save, Send, User, BookOpen, 
  Phone, MapPin, CheckCircle, ArrowLeft, AlertCircle 
} from 'lucide-react';

const BiodataForm = () => {
  // 1. Check if the portal is actually open (Lazy Initialization)
  const [isPortalOpen] = useState(() => {
    const savedSettings = localStorage.getItem('portal_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return parsed.status === 'open';
    }
    return false; // Defaults to false if nothing is saved
  });

  // 2. Manage Login State
  const [pin, setPin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 3. Form Data State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    previousSchool: '',
    jambScore: '',
    sponsorName: '',
    sponsorPhone: ''
  });

  // Handle PIN Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Basic Validation: Just checking if it looks like our generated PINs for this mockup
    if (!pin.toUpperCase().startsWith('CUB-2026-')) {
      setLoginError('Invalid Application PIN format. Must start with CUB-2026-');
      return;
    }

    // Check if this specific PIN has already been submitted
    const submissionStatus = localStorage.getItem(`submitted_${pin.toUpperCase()}`);
    if (submissionStatus === 'true') {
      setIsSubmitted(true);
      setIsLoggedIn(true);
      return;
    }

    // Load saved draft for this PIN if it exists
    const savedDraft = localStorage.getItem(`draft_${pin.toUpperCase()}`);
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }

    setIsLoggedIn(true);
  };

  // Handle Form Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const updatedData = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedData);
  };

  // Save Draft Progress manually
  const saveDraft = () => {
    localStorage.setItem(`draft_${pin.toUpperCase()}`, JSON.stringify(formData));
    alert('Progress Saved! You can return later using your PIN.');
  };

  // Final Submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this sends data to your backend
    localStorage.setItem(`submitted_${pin.toUpperCase()}`, 'true');
    localStorage.removeItem(`draft_${pin.toUpperCase()}`); // Clear the draft
    
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  // VIEW 1: Portal is Closed
  if (!isPortalOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portal Closed</h1>
          <p className="text-gray-500 mb-6">The admission portal is currently not accepting biodata submissions. Please check back later.</p>
          <Link to="/" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  // VIEW 2: PIN Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Biodata Portal</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your Application PIN to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="pin" className="block text-sm font-bold text-gray-700 mb-2">Application PIN</label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-3 top-3 text-gray-400" aria-hidden="true" />
                <input 
                  id="pin"
                  type="text" 
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono tracking-widest text-lg"
                  placeholder="CUB-2026-XXXXX" 
                />
              </div>
              {loginError && <p className="text-red-500 text-xs mt-2 font-semibold">{loginError}</p>}
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition shadow-md">
              Access Portal
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 3: Already Submitted Success Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-green-500">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Locked</h1>
          <p className="text-gray-600 mb-6 border-b pb-6">
            Your biodata for PIN <strong className="font-mono text-blue-600">{pin}</strong> has already been submitted successfully. 
            You can no longer edit this information.
          </p>
          <button onClick={() => window.print()} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-black transition mb-3 shadow-md">
            Print Acknowledgment Slip
          </button>
          <Link to="/" className="text-blue-600 font-bold hover:underline block">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // VIEW 4: The Actual Biodata Form
  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-12">
      {/* Form Header */}
      <header className="bg-slate-900 text-white py-6 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Official Biodata Form</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Logged in as: <span className="font-mono text-blue-300 tracking-wider">{pin}</span>
            </p>
          </div>
          <button 
            onClick={saveDraft}
            className="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition border border-slate-700"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmitForm} className="space-y-8">
          
          {/* Section 1: Personal Details */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
              <User className="w-5 h-5 text-blue-600" /> Personal Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Last Name (Surname)</label>
                <input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                <input id="dateOfBirth" type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select id="gender" name="gender" required value={formData.gender} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="">Select Gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Residential Address</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" aria-hidden="true" />
                  <input id="address" name="address" required value={formData.address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Sponsor Details */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
              <BookOpen className="w-5 h-5 text-blue-600" /> Academic & Sponsorship
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="previousSchool" className="block text-sm font-semibold text-gray-700 mb-2">Last School Attended</label>
                <input id="previousSchool" name="previousSchool" required value={formData.previousSchool} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="jambScore" className="block text-sm font-semibold text-gray-700 mb-2">JAMB Score (if applicable)</label>
                <input id="jambScore" name="jambScore" type="number" value={formData.jambScore} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="sponsorName" className="block text-sm font-semibold text-gray-700 mb-2">Sponsor Full Name</label>
                <input id="sponsorName" name="sponsorName" required value={formData.sponsorName} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="sponsorPhone" className="block text-sm font-semibold text-gray-700 mb-2">Sponsor Phone Number</label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3 top-3 text-gray-400" aria-hidden="true" />
                  <input id="sponsorPhone" name="sponsorPhone" type="tel" required value={formData.sponsorPhone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="button" 
              onClick={saveDraft}
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-4 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Save Progress
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Submit Final Application <Send className="w-5 h-5" />
            </button>
          </div>
          
        </form>
      </main>
    </div>
  );
};

export default BiodataForm;