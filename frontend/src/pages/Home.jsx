import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  

  return (
  <>
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white">
      {/* Sidebar - static on desktop */}
      <div className="w-64 flex-shrink-0 hidden md:block">
        <Sidebar />
      </div>
     

     <div className="md:hidden">
           <Sidebar />
         </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar/>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Welcome to <span className="text-purple-400">Chatrio</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
            Connect with friends, learn new languages, and grow together 🎉
          </p>

          
        </main>
      </div>
    </div>

    {/* Footer */}
    <Footer />
  </>
);

};

export default Home;