import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, ShieldCheck, HelpCircle, 
  Phone, Mail, MapPin, Facebook, Youtube, MessageCircle 
} from 'lucide-react';


// Custom component to animate numbers counting up
const AnimatedCounter = ({ target, suffix = "" }: { target: number, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2000; // 2 seconds to complete animation

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Easing function for smooth slowdown at the end
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); 
      
      setCount(Math.floor(easeOutQuart * target));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [target]);

  return <span>{count}{suffix}</span>;
};

const Home = () => {
  const [admissionStatus] = useState<string>(() => {
    return localStorage.getItem('portal_status') || 'coming_soon';
  });

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 md:h-12 overflow-hidden flex items-center justify-center">
            <img src="/images/cul_logo_rect.png" alt="Caleb University" className="h-full w-auto object-contain" />
          </div>
        </div>
        
        {/* Support Dropdown Menu */}
        <div className="relative group">
          <button className="text-sm font-semibold text-gray-600 hover:text-blue-700 transition flex items-center gap-1 py-2">
            <HelpCircle className="w-4 h-4" /> Support
          </button>
          
          {/* Dropdown Card */}
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-100 shadow-xl rounded-lg p-5 hidden group-hover:block z-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Support</p>
            <a href="#" className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-600 transition mb-3">
              <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Support
            </a>
            <a href="tel:0201-2910684" className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition mb-3">
              <Phone className="w-4 h-4 text-blue-500" /> 0201-2910684
            </a>
            <a href="mailto:info@calebuniversity.edu.ng" className="flex items-center gap-3 text-sm text-gray-700 hover:text-red-600 transition">
              <Mail className="w-4 h-4 text-red-500" /> info@calebuniversity.edu.ng
            </a>
          </div>
        </div>
      </nav>

      {/* Main Admission Hero Section */}
      <header className="bg-slate-900 text-white py-12 md:py-20 px-6 relative overflow-hidden flex-grow flex items-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-block bg-blue-800/50 border border-blue-700 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs md:text-sm font-semibold text-blue-200 uppercase tracking-wider">
                Application Portal
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
              2026/2027 Admissions
            </h1>
            <p className="text-sm md:text-base mb-8 text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Welcome to the Caleb University admission portal. Ensure you have your credentials ready before purchasing the application form.
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

          {/* Dynamic Action Card */}
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

      {/* Animated University Statistics Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">
                <AnimatedCounter target={15} suffix="+" />
              </p>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">Years of Excellence</p>
            </div>
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">
                <AnimatedCounter target={40} suffix="+" />
              </p>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">Programs Offered</p>
            </div>
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">
                <AnimatedCounter target={10} suffix=",000+" />
              </p>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">Graduates Worldwide</p>
            </div>
            <div className="px-4 border-l-0 md:border-l">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">
                <AnimatedCounter target={30} suffix="+" />
              </p>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">Global Lecturers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Contact Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-300 py-12 border-t-[6px] border-blue-600">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          
          {/* Brand Column */}
          <div>
            <div className="h-12 bg-white p-2 rounded inline-flex items-center justify-center mb-4">
              <img src="/images/cul_logo_rect.png" alt="Caleb Logo" className="h-full w-auto object-contain" />
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Empowering the next generation of leaders with world-class education, innovation, and character development.
            </p>
            
            {/* Social Links (Dummy Links for now) */}
            <div className="flex gap-4">
              <a 
                href="#" 
                aria-label="Visit our Facebook page" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                aria-label="Visit our YouTube channel" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                aria-label="Contact us on WhatsApp" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Contact Us</h3>
            <div className="grid sm:grid-cols-2 gap-6 text-sm text-slate-400">
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <p>
                    <strong className="text-slate-200 block mb-1">Main Campus</strong>
                    KM 15, Ikorodu-Itoikin Road,<br />
                    Imota, Lagos.<br />
                    P.M.B. 21238, Ikeja
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200 block mb-1">Phone Lines</strong>
                    <p className="mb-1">0201-2910684</p>
                    <p className="mb-1">0201-2910685</p>
                    <p>0201-2910686</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 pt-2">
                  <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200 block mb-1">Email Support</strong>
                    <a href="mailto:info@calebuniversity.edu.ng" className="hover:text-blue-400 transition-colors">
                      info@calebuniversity.edu.ng
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
        
        {/* Copyright Bar */}
        <div className="max-w-6xl mx-auto px-6 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Caleb University Admissions. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default Home;