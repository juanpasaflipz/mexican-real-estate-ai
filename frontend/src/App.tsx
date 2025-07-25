import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Dashboard from './components/Dashboard/Dashboard'
import BrokerApplication from './components/Dashboard/BrokerApplication'
import BrokerApplicationReview from './pages/BrokerApplicationReview'
// @ts-ignore
import { BlogList, BlogPost } from './pages/Blog.jsx'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import MapSearch from './pages/MapSearch'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import AuthTest from './pages/AuthTest'
import LogoDemo from './pages/LogoDemo'
import NearbyMapTest from './pages/NearbyMapTest'
import TestProperties from './pages/TestProperties'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/test" element={<AuthTest />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/broker/apply" element={<BrokerApplication />} />
                <Route path="/admin/broker-applications" element={<BrokerApplicationReview />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/map" element={<MapSearch />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/logo-demo" element={<LogoDemo />} />
                <Route path="/nearby-map-test" element={<NearbyMapTest />} />
                <Route path="/test-properties" element={<TestProperties />} />
              </Routes>
            <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App