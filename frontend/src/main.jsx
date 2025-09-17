import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient,QueryClientProvider} from "@tanstack/react-query"
import './index.css'
import App from './App.jsx'
import CallPopup from './components/callPopup.jsx'
import { Provider } from 'react-redux'
import "stream-chat-react/dist/css/v2/index.css";
import { store} from '../store/store.js'

const queryclient=new QueryClient()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
    <QueryClientProvider client={queryclient }>
     <App />
     <CallPopup/>
     </QueryClientProvider>
     </Provider>
    </BrowserRouter>
   
  </StrictMode>,
)
