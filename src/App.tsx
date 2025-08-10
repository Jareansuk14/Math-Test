import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { useAuthStore } from './store/authStore';
import StudentAuth from './pages/StudentAuth';
import AdminLogin from './pages/AdminLogin';
import ExamPage from './pages/ExamPage';
import SummaryPage from './pages/SummaryPage';
import QuestionsManagement from './pages/QuestionsManagement';
import StudentsManagement from './pages/StudentsManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'admin')[];
}

function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin/students' : '/'} replace />;
  }

  return <>{children}</>;
}

// Enhanced auth store with query client clearing
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { clearAuth: originalClearAuth } = useAuthStore();

  useEffect(() => {
    // Store the enhanced clear function globally for access from auth store
    (window as any).clearQueryCache = () => queryClient.clear();
  }, [originalClearAuth]);

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<StudentAuth />} />
            <Route path="/admin" element={<AdminLogin />} />

            {/* Student protected routes */}
            <Route
              path="/exam"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/summary/:resultId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SummaryPage />
                </ProtectedRoute>
              }
            />

            {/* Admin protected routes */}
            <Route
              path="/admin/questions"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <QuestionsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentsManagement />
                </ProtectedRoute>
              }
            />

            {/* Redirect admin routes */}
            <Route path="/admin/dashboard" element={<Navigate to="/admin/students" replace />} />
            <Route path="/admin/results" element={<Navigate to="/admin/students" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
