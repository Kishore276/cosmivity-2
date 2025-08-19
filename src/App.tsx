import { Routes, Route } from 'react-router-dom'
import { UserProvider } from '@/context/UserContext'
import { Toaster } from '@/components/ui/toaster'

// Import pages
import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import ResumePage from '@/pages/ResumePage'
import PracticePage from '@/pages/PracticePage'
import RoomsPage from '@/pages/RoomsPage'
import CreateRoomPage from './pages/CreateRoomPage';
import { JoinPrivateRoomPage } from './pages/RoomsPage';
import BgGradientDemo from '@/components/ui/bg-gradient-demo';

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/settings" element={<SettingsPage />} />
          <Route path="/resume/*" element={<ResumePage />} />
          <Route path="/practice/*" element={<PracticePage />} />
          <Route path="/rooms/*" element={<RoomsPage />} />
          <Route path="/create-room" element={<CreateRoomPage />} />
          <Route path="/join-private-room" element={<JoinPrivateRoomPage />} />
          <Route path="/bg-gradient-demo" element={<BgGradientDemo />} />
        </Routes>
        <Toaster />
      </div>
    </UserProvider>
  )
}

export default App
