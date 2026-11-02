import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { LandingLayout } from '@/components/layout/LandingLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Recommend } from '@/pages/Recommend'
import { Browse } from '@/pages/Browse'
import { LaptopDetail } from '@/pages/LaptopDetail'
import { Profile } from '@/pages/Profile'
import { Analytics } from '@/pages/Analytics'
import { Compare } from '@/pages/Compare'
import { NotFound } from '@/pages/NotFound'

function AppRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/laptops/:id" element={<LaptopDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
