import { Routes,Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Call from "./pages/Call"
import Notification from "./pages/Notification"
import Onboard from "./pages/Onboard"
import Messages from "./pages/Messages"
import VerifyOtp from "./pages/VerifyOtp"
import Friends from "./pages/Friends"
import ChatPage from "./pages/Chat"
import LandingPage from "./pages/LandingPage"
import useAuthUser from "./hooks/useAuthUser"
import { useNavigate } from "react-router-dom"
import ProtectedRoute from "./components/protectedRoute"
import { Toaster } from "react-hot-toast";


const App = () => {

 
  
  return (
    <div className="h-screen" data-theme="retro">
     
<Routes>
<Route path="/" element={ <LandingPage/> }/>
<Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute> } />
<Route path="/signup" element={<Signup/>}/>
<Route path="/login" element={<Login/>}/>
<Route path="/notification" element={<ProtectedRoute><Notification /></ProtectedRoute> }/>
<Route path="/call/:id" element={<ProtectedRoute><Call /></ProtectedRoute> }/>
<Route path="/chat/:id" element={<ChatPage />}/>
<Route path="/onboard" element={<Onboard/>}/>
<Route path="/verify" element={<VerifyOtp/>}/>
<Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute> }/>
<Route path="/messages" element={<Messages /> }/>





</Routes>




 <Toaster
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    duration: 3000, 
    success: {
      duration: 2500,
    },
    error: {
      duration: 4000,
    },
  }}
/>

    </div>
  )
}

export default App
