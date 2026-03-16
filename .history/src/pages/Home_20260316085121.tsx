import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, HelpCircle } from 'lucide-react';

const Home = () => {
  const [admissionStatus] = useState<string>(() => {
    return localStorage.getItem('portal_status') || 'coming_soon';
  });

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      
      {/* Navbar - Simplified for Admission Focus */}
      <nav className="bg-white shadow-sm py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Logo - Path relies on the image being in the public/images/ folder */}
          <div className="h-10 md:h-12 overflow-hidden flex items-center justify-center">
            <img src="/images/cul_logo_rect.png" alt="Caleb University" className="h-full w-auto object-contain" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm font-semibold text-gray-600 hover:text-blue-700 transition flex items-center gap-1">
            <HelpCircle className="w-4 h-4" /> Support
          </a>
        </div>
      </nav>

      {/* Main Admission Hero Section */}
      <header className="bg-slate-900 text-white py-12 md:py-20 px-6 relative overflow-hidden">
        {/* Subtle background pattern to make it look less plain */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-block bg-blue-800/50 border border-blue-700 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs md:text-sm font-semibold text-blue-200 uppercase tracking-wider">
                Official Application Portal
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
              2026/2027 Admissions
            </h1>
            <p className="text-sm md:text-base mb-8 text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Welcome to the Caleb University official admission portal. Ensure you have your credentials ready before purchasing the application form.
            </p>

            {/* Application Steps */}
            <div className="hidden lg:flex flex-col gap-4 text-slate-200 mt-8 text-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold">1</span>
                Pay the ₦10,000 application fee online.
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold">2</span>
                Receive your secure Application PIN.
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold">3</span>
                Complete your biodata and print your generated PDF form.
              </div>
            </div>
          </div>

          {/* Dynamic Action Card (The Sales Focus) */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-2xl border-t-4 border-blue-600">
              <h2 className="text-xl font-bold mb-6 text-center text-gray-800 border-b pb-4">
                Application Status
              </h2>
              
              {admissionStatus === 'open' && (
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <span className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Portal is currently OPEN
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Undergraduate and Postgraduate forms are available for purchase.
                  </p>
                  <Link 
                    to="/apply" 
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <FileText className="w-5 h-5" />
                    Purchase Form (₦10,000)
                  </Link>
                  <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure Payment Gateway
                  </p>
                </div>
              )}

              {admissionStatus === 'closed' && (
                <div className="text-center">
                  <p className="text-red-600 font-bold mb-2 text-lg">
                    Admissions are CLOSED.
                  </p>
                  <p className="text-sm text-gray-500">
                    The application window for the current session has ended. Please check back later.
                  </p>
                </div>
              )}

              {admissionStatus === 'coming_soon' && (
                <div className="text-center">
                  <p className="text-yellow-600 font-bold mb-2 text-lg">
                    Admissions Opening Soon
                  </p>
                  <p className="text-sm text-gray-500">
                    We are finalizing preparations. The portal will open shortly.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* University Statistics Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">15+</p>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">Years of Excellence</p>
            </div>
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">40+</p>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">Programs Offered</p>
            </div>
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">10k+</p>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">Graduates Worldwide</p>
            </div>
            <div className="px-4 border-l-0 md:border-l">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">30+</p>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">Global Lecturers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="mt-auto py-6 bg-gray-50 text-center border-t border-gray-200">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Caleb University Admissions. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;