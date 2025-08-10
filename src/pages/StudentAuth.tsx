import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export default function StudentAuth() {
  const [tabValue, setTabValue] = useState(0);
  const [registerForm, setRegisterForm] = useState({
    studentId: '',
    name: '',
    school: '',
  });
  const [loginForm, setLoginForm] = useState({
    studentId: '',
  });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { setUser, isAuthenticated, role } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'student') {
        navigate('/exam', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/students', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      setUser(data, 'student');
      navigate('/exam');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    },
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.loginStudent,
    onSuccess: (data) => {
      setUser(data, 'student');
      navigate('/exam');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!registerForm.studentId || !registerForm.name || !registerForm.school) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    registerMutation.mutate(registerForm);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginForm.studentId) {
      setError('กรุณากรอกรหัสนักเรียน');
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const isLoading = registerMutation.isPending || loginMutation.isPending;

  // Show loading while checking authentication
  if (isAuthenticated) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3 },
        minHeight: '100vh',
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        paddingTop: { xs: '20px', sm: 0 }
      }}
    >
      <Paper 
        elevation={isMobile ? 0 : 3} 
        sx={{ 
          p: { xs: 3, sm: 4 },
          width: '100%',
          backgroundColor: isMobile ? 'transparent' : 'background.paper',
          borderRadius: { xs: 0, sm: 2 },
          boxShadow: isMobile ? 'none' : undefined
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          align="center" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: 600,
            mb: { xs: 2, sm: 3 },
            lineHeight: 1.2
          }}
        >
          แบบฝึกหัดคณิตศาสตร์
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 1, sm: 0 } }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, v) => setTabValue(v)} 
            centered
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
                textTransform: 'none',
              }
            }}
          >
            <Tab label="เข้าสู่ระบบ" />
            <Tab label="สมัครสมาชิก" />
          </Tabs>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              borderRadius: { xs: 1, sm: 2 }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Login Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box 
            component="form" 
            onSubmit={handleLoginSubmit}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 3 }
            }}
          >
            <TextField
              fullWidth
              label="รหัสนักเรียน"
              value={loginForm.studentId}
              onChange={(e) => setLoginForm({ studentId: e.target.value })}
              required
              disabled={isLoading}
              variant="outlined"
              autoComplete="username"
              autoFocus={!isMobile}
              InputProps={{
                sx: {
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  borderRadius: { xs: 1, sm: 2 }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={isMobile ? "medium" : "large"}
              disabled={isLoading}
              sx={{
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600,
                borderRadius: { xs: 1, sm: 2 },
                boxShadow: isMobile ? 1 : 2,
                '&:hover': {
                  boxShadow: isMobile ? 2 : 3,
                }
              }}
            >
              {isLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} color="inherit" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </Stack>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </Button>
          </Box>
        </TabPanel>

        {/* Register Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box 
            component="form" 
            onSubmit={handleRegisterSubmit}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 3 }
            }}
          >
            <TextField
              fullWidth
              label="รหัสนักเรียน"
              value={registerForm.studentId}
              onChange={(e) => setRegisterForm({ ...registerForm, studentId: e.target.value })}
              required
              disabled={isLoading}
              autoComplete="username"
              autoFocus={!isMobile}
              InputProps={{
                sx: {
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  borderRadius: { xs: 1, sm: 2 }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }
              }}
            />
            <TextField
              fullWidth
              label="ชื่อ-นามสกุล"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              required
              disabled={isLoading}
              autoComplete="name"
              InputProps={{
                sx: {
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  borderRadius: { xs: 1, sm: 2 }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }
              }}
            />
            <TextField
              fullWidth
              label="ชื่อโรงเรียน"
              value={registerForm.school}
              onChange={(e) => setRegisterForm({ ...registerForm, school: e.target.value })}
              required
              disabled={isLoading}
              autoComplete="organization"
              InputProps={{
                sx: {
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  borderRadius: { xs: 1, sm: 2 }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={isMobile ? "medium" : "large"}
              disabled={isLoading}
              sx={{
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600,
                borderRadius: { xs: 1, sm: 2 },
                boxShadow: isMobile ? 1 : 2,
                '&:hover': {
                  boxShadow: isMobile ? 2 : 3,
                }
              }}
            >
              {isLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} color="inherit" />
                  <span>กำลังสมัครสมาชิก...</span>
                </Stack>
              ) : (
                'สมัครสมาชิก'
              )}
            </Button>
          </Box>
        </TabPanel>

        <Box sx={{ 
          mt: { xs: 3, sm: 4 }, 
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
          pt: { xs: 2, sm: 3 }
        }}>
          <Button
            variant="text"
            onClick={() => navigate('/admin')}
            size="small"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            เข้าสู่ระบบแอดมิน
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 