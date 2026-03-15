import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';

const Home = () => {
  const [admissionStatus] = useState<string>(() => {
    return localStorage.getItem('portal_status') || 'coming_soon';
  });

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      
      {/* Navbar with Main Logo Placeholder */}
      <nav className="bg-white shadow-sm py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Main Logo Image Tag */}
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-500 border border-gray-300 overflow-hidden">
            {<img src="/images/cul_logo_rect.png" alt="Caleb University Logo" className="w-full h-full object-contain" />}
          </div>
          <span className="font-bold text-lg md:text-2xl text-blue-900 hidden sm:block">
            Caleb University
          </span>
        </div>
        <div className="space-x-6 hidden md:flex text-sm font-semibold text-gray-600">
          <a href="#" className="hover:text-blue-700 transition">Academics</a>
          <a href="#" className="hover:text-blue-700 transition">Admissions</a>
          <a href="#" className="hover:text-blue-700 transition">Campus Life</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-blue-900 text-white py-12 md:py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
              Future-Ready Education
            </h1>
            <p className="text-sm md:text-lg mb-4 font-medium text-blue-300 uppercase tracking-widest">
              "For God and Humanity"
            </p>
            <p className="text-sm md:text-base mb-8 text-blue-100 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join a community driven by academic excellence, godly principles, and innovative learning. 
              Secure your future with Caleb University today.
            </p>

            {/* Dynamic Admission Banner */}
            <div className="bg-white text-gray-900 p-6 md:p-8 rounded-xl shadow-2xl text-left border-l-4 border-blue-500 max-w-lg mx-auto lg:mx-0">
              <h2 className="text-xl md:text-2xl font-bold mb-3 border-b pb-3 text-gray-800">2026/2027 Admissions</h2>
              
              {admissionStatus === 'open' && (
                <div>
                  <p className="text-green-700 font-semibold mb-4 text-sm md:text-base flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Admission Sales are currently OPEN.
                  </p>
                  <Link 
                    to="/apply" 
                    className="block text-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all w-full text-sm md:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Purchase Form (₦10,000)
                  </Link>
                </div>
              )}

              {admissionStatus === 'closed' && (
                <div>
                  <p className="text-red-600 font-semibold mb-2 text-sm md:text-base">
                    🔴 Admissions are currently CLOSED.
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
                    The application window has ended. Please check back later.
                  </p>
                </div>
              )}

              {admissionStatus === 'coming_soon' && (
                <div>
                  <p className="text-yellow-600 font-semibold mb-2 text-sm md:text-base">
                    ⏳ Admissions Opening Soon
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
                    We are finalizing preparations. The portal will open shortly.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* YouTube Video Embed */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-lg aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-[6px] border-blue-800/50">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/2LeY3Big4_4?autoplay=0&rel=0" 
                title="Caleb University - Grooming Today's Generation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>

        </div>
      </header>

      {/* Image and Info Section */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            
            {/* Contextual Image Placeholder */}
            <div className="bg-gray-100 aspect-[4/3] w-full rounded-2xl flex flex-col items-center justify-center text-gray-400 shadow-inner border-2 border-dashed border-gray-300 overflow-hidden relative group">
              <span className="text-sm md:text-base font-medium z-10">[Insert Campus/Student Image Here]</span>
              {/* <img src="/images/campus-life.jpg" alt="Campus Life" className="w-full h-full object-cover absolute top-0 left-0" /> */}
            </div>
            
            <div className="space-y-5 text-center md:text-left">
              <h3 className="text-2xl md:text-4xl font-bold text-gray-900">Experience the Best Environment</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Our state-of-the-art facilities and serene campus provide the perfect backdrop for academic focus and personal growth. 
                Discover a place where theoretical knowledge meets practical application.
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-800 text-sm md:text-base underline underline-offset-4">
                Explore Our Campus →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 px-6 bg-gray-50 mb-10">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Caleb?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-3 text-gray-900">Academic Excellence</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Accredited programmes designed to meet rigorous global standards.
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-3 text-gray-900">Godly Character</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                A conducive environment focused on moral development and true values.
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-3 text-gray-900">Future Ready</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Producing skilled graduates equipped for the global marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;