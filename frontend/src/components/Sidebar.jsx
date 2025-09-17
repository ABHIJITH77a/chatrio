import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Home,
  Users2,
  MessageCirclePlus,
  X,
} from "lucide-react";
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";

const Sidebar = () => {
  const { user } = useAuthUser();
  console.log("iiiiiiii",user)
  const navigate=useNavigate()
  const location = useLocation();
  const currentPath = location.pathname;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay background */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 
  text-white p-6 flex flex-col gap-6 overflow-auto transform transition-transform duration-300 z-40
  fixed top-0 left-0 h-screen w-64
  ${isOpen ? "translate-x-0" : "-translate-x-full"} 
  md:translate-x-0 md:static md:flex md:w-64 md:h-full md:min-h-screen`}

      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 md:hidden text-white hover:text-gray-300 transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-6 w-6" />
        </button>

        <h1 className="text-2xl font-bold mb-6">Chatrio</h1>

        <nav className="flex flex-col gap-4">
         <Link
  to="/home"
  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
    currentPath === "/home" 
      ? "bg-white bg-opacity-20 text-black shadow-lg"  
      : "text-gray-900 hover:bg-white hover:bg-opacity-10 hover:text-black" // ⬅️ also black for hover
  }`}
  onClick={() => setIsOpen(false)}
>
  <Home className="w-5 h-5" /> Home
</Link>


          <Link
            to="/friends"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPath === "/friends" 
                ? "bg-white bg-opacity-20 text-black shadow-lg" 
                : "text-gray-900 hover:bg-white hover:bg-opacity-10 hover:text-black"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Users2 className="w-5 h-5" /> Friends
          </Link>

          <Link
            to="/messages"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPath === "/messages" 
                ? "bg-white bg-opacity-20 text-black shadow-lg" 
                : "text-gray-900 hover:bg-white hover:bg-opacity-10 hover:text-black"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <MessageCirclePlus className="w-5 h-5" /> Messages
          </Link>

          <Link
            to="/notification"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPath === "/notification" 
                ? "bg-white bg-opacity-20 text-black shadow-lg" 
                : "text-gray-900 hover:bg-white hover:bg-opacity-10 hover:text-black"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Bell className="w-5 h-5" /> Notifications
          </Link>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white border-opacity-20 mt-auto">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white border-opacity-30">
                <img onClick={()=>navigate("/onboard")}
                  src={user?.profilPic} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-white">{user?.fullName}</p>
              <p className="text-xs text-green-300 flex items-center gap-1">
                <span className="size-2 rounded-full bg-green-400 inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-700 hover:bg-purple-800 p-2 rounded-md transition-colors shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
};

export default Sidebar;
