import { useNavigate } from "react-router-dom";
import chatrio from "../assets/chat Trio.png"


export default function LandingPage() {
  const navigate=useNavigate()
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 bg-indigo-950/80 backdrop-blur-md shadow-md h-16">
  {/* Left: Logo + Title */}
  <div className="flex items-center gap-3 flex-shrink-0">
    <img 
      src={chatrio} 
      alt="Chatrio Logo" 
      className="h-30 w-auto object-contain"
    />
  </div>
        <nav className="hidden md:flex gap-6 text-lg font-medium">
          <a href="#features" className="hover:text-purple-300">Features</a>
          <a href="#community" className="hover:text-purple-300">Community</a>
          <a href="#about" className="hover:text-purple-300">About</a>
        </nav>
        <div className="flex gap-3">
          <button onClick={()=>navigate("/login")} className="px-4 py-2 rounded-xl border border-purple-400 hover:bg-purple-800 transition">
            Sign In
          </button>
          <button  onClick={()=>navigate("/signup")}    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition">
            Join Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
          Learn languages <span className="text-purple-400">together</span> with friends
        </h2>
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
          Chatrio makes language learning social, fun, and interactive.
          Practice, chat, and grow your fluency with friends worldwide.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
          <button  onClick={()=>navigate("/login")}  className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 font-semibold text-lg shadow-lg">
            Start Explore
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 border-t border-purple-700">
        <p>© {new Date().getFullYear()} Chatrio. Learn languages with friends 🌍</p>
      </footer>
    </div>
  );
}
