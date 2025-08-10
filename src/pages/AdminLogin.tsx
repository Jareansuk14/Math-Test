import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { setUser, isAuthenticated, role } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin/students', { replace: true });
      } else if (role === 'student') {
        navigate('/exam', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const loginMutation = useMutation({
    mutationFn: authAPI.loginAdmin,
    onSuccess: (data) => {
      setUser(data, 'admin');
      navigate('/admin/dashboard');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    loginMutation.mutate(form);
  };

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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 }
        }}>
          <AdminPanelSettings 
            sx={{ 
              fontSize: { xs: 32, sm: 40 }, 
              color: 'primary.main'
            }} 
          />
          <Typography 
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            เข้าสู่ระบบแอดมิน
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              borderRadius: { xs: 1, sm: 2 }
            }}
          >
            {error}
          </Alert>
        )}

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 3 }
          }}
        >
          <TextField
            fullWidth
            label="อีเมล"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={loginMutation.isPending}
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
            label="รหัสผ่าน"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            disabled={loginMutation.isPending}
            autoComplete="current-password"
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
            disabled={loginMutation.isPending}
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
            {loginMutation.isPending ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} color="inherit" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </Stack>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </Button>
        </Box>

        <Box sx={{ 
          mt: { xs: 3, sm: 4 }, 
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
          pt: { xs: 2, sm: 3 }
        }}>
          <Button
            variant="text"
            onClick={() => navigate('/')}
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
            กลับไปหน้าหลัก
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 