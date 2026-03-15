import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';

const Home = () => {
  // FIX: Lazy state initialization. Reads localStorage synchronously on the first render.
  // This completely eliminates the useEffect warning and cascading renders.
  const [admissionStatus] = useState<string>(() => {
    return localStorage.getItem('portal_status') || 'coming_soon';
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-blue-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Caleb University Admissions</h1>
          <p className="text-xl mb-2 font-semibold text-blue-200">
            "For God and Humanity"
          </p>
          <p className="text-lg mb-10 max-w-2xl mx-auto text-blue-100">
            Join a community driven by academic excellence, godly principles, and innovative learning. 
            Secure your future today.
          </p>

          {/* Dynamic Admission Banner area */}
          <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">2026/2027 Academic Session</h2>
            
            {admissionStatus === 'open' && (
              <div>
                <p className="text-green-700 font-semibold mb-4 text-lg">
                  🟢 Admission Sales are currently OPEN.
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Applications are invited from suitably qualified candidates for admission into our 
                  Undergraduate, Postgraduate, Pre-Degree, and Direct Entry programmes.
                </p>
                <Link 
                  to="/apply" 
                  className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded hover:bg-blue-700 transition-colors w-full"
                >
                  Purchase Admission Form (₦10,000)
                </Link>
              </div>
            )}

            {admissionStatus === 'closed' && (
              <div>
                <p className="text-red-600 font-semibold mb-2 text-lg">
                  🔴 Admissions are currently CLOSED.
                </p>
                <p className="text-gray-600">
                  The application window for the current session has ended. 
                  Please check back later for updates on the next intake.
                </p>
              </div>
            )}

            {admissionStatus === 'coming_soon' && (
              <div>
                <p className="text-yellow-600 font-semibold mb-2 text-lg">
                  ⏳ Admissions Opening Soon
                </p>
                <p className="text-gray-600">
                  We are finalizing preparations for the 2026/2027 academic session. 
                  The admission sales portal will be open shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* University Value Proposition */}
      <section className="py-16 px-6 bg-gray-50 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-lg shadow-sm border-t-4 border-blue-600">
              <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Academic Excellence</h4>
              <p className="text-gray-600 text-sm">
                Accredited programmes designed to meet global standards across all our Colleges.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border-t-4 border-blue-600">
              <ShieldCheck className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Godly Character</h4>
              <p className="text-gray-600 text-sm">
                A conducive environment focused on moral development, discipline, and true Christian values.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border-t-4 border-blue-600">
              <GraduationCap className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Future Ready</h4>
              <p className="text-gray-600 text-sm">
                Producing highly skilled graduates equipped for the global marketplace and entrepreneurial success.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;