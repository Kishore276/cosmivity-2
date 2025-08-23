import { Routes, Route } from 'react-router-dom'
import { UserProvider, useUser } from '@/context/UserContext'
import { Toaster } from '@/components/ui/toaster'
import { useEffect, lazy, Suspense } from 'react'
import { roomsService } from '@/lib/firebase-services'

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const ResumePage = lazy(() => import('@/pages/ResumePage'))
const PracticePage = lazy(() => import('@/pages/PracticePage'))
const RoomsPage = lazy(() => import('@/pages/RoomsPage'))
const CreateRoomPage = lazy(() => import('./pages/CreateRoomPage'))
const JoinPrivateRoomPage = lazy(() => import('./pages/RoomsPage').then(module => ({ default: module.JoinPrivateRoomPage })))
const BgGradientDemo = lazy(() => import('@/components/ui/bg-gradient-demo'))

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { loading } = useUser();
  
  useEffect(() => {
    // Start the room auto-deletion service when the app initializes
    const stopAutoDeleteService = roomsService.startAutoDeleteService();
    
    // Cleanup function to stop the service when the app unmounts
    return () => {
      stopAutoDeleteService();
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<LoadingScreen />}>
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
      </Suspense>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}

export default App
