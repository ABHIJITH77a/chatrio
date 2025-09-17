import useLogout from "../hooks/useLogout";
import { LogOut, Menu } from "lucide-react";
import chatrio from "../assets/chat Trio.png"

const Navbar = ({ onMenuClick }) => {
  const { logoutMutation } = useLogout();
   return (
  <header className="bg-gradient-to-r from-indigo-950 to-purple-900 text-white h-16 px-4 flex items-center shadow-lg z-20 md:ml-0">
    {/* Mobile Menu Button */}
    <button
      className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
      onClick={onMenuClick}
    >
      <Menu className="h-6 w-6 text-white" />
    </button>

    {/* Logo centered */}
    <div className="flex-1 flex justify-center">
      <img
        src={chatrio}
        alt="Chatrio Logo"
        className="h-25 object-contain"
      />
    </div>

    {/* Logout Button */}
    <button
      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
      onClick={logoutMutation}
    >
      <LogOut className="h-5 w-5 text-white" />
    </button>
  </header>
);

}

export default Navbar;