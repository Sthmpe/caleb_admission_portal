import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users } from 'lucide-react';

const Home = () => {
  // State to hold our admission status: 'open', 'closed', or 'coming_soon'
  const [admissionStatus, setAdmissionStatus] = useState<string>('coming_soon');

  // When the page loads, check localStorage for the current status
  useEffect(() => {
    const savedStatus = localStorage.getItem('portal_status');
    if (savedStatus) {
      setAdmissionStatus(savedStatus);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-blue-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Caleb University</h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-blue-100">
            Empowering the next generation of leaders with world-class education, 
            innovation, and character development.
          </p>

          {/* Dynamic Admission Banner area */}
          <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">2026/2027 Admissions</h2>
            
            {admissionStatus === 'open' && (
              <div>
                <p className="text-green-600 font-semibold mb-4 text-lg">
                  🟢 Undergraduate and Postgraduate Applications are now OPEN.
                </p>
                <Link 
                  to="/apply" 
                  className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded hover:bg-blue-700 transition-colors"
                >
                  Start Your Application
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
                  We are finalizing preparations for the upcoming academic session. 
                  The portal will be open shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Placeholder University Content */}
      <section className="py-16 px-6 bg-gray-50 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Caleb?</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Academic Excellence</h4>
              <p className="text-gray-600">Accredited programs designed to meet global standards.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Expert Faculty</h4>
              <p className="text-gray-600">Learn from industry professionals and seasoned academics.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <GraduationCap className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Career Ready</h4>
              <p className="text-gray-600">Practical skills and networking to launch your career.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;