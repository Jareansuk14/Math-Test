import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import { LogoutOutlined, School, Person, MenuOutlined } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useExamStore } from '../store/examStore';
import type { Student } from '../types';

export default function HeaderBar() {
  const { user, role, clearAuth } = useAuthStore();
  const { resetExam } = useExamStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSettled: () => {
      resetExam(); // Reset exam state first
      clearAuth(); // Then clear auth
      navigate('/');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!user || role !== 'student') return null;

  const student = user as Student;

  // Mobile layout
  if (isMobile) {
    return (
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Student info button */}
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Person />
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {student.name}
              </Typography>
              <MenuOutlined fontSize="small" />
            </IconButton>
          </Box>

          {/* Mobile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                minWidth: 280,
                mt: 1,
              },
            }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Stack spacing={1} sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>
                    {student.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  รหัส: {student.studentId}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {student.school}
                  </Typography>
                </Box>
              </Stack>
            </MenuItem>
            <MenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
              <LogoutOutlined sx={{ mr: 1 }} />
              ออกจากระบบ
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    );
  }

  // Desktop layout
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Student info chips */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<Person />}
              label={student.name}
              variant="outlined"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
            <Chip
              label={`รหัส: ${student.studentId}`}
              variant="outlined"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
              }}
            />
            <Chip
              icon={<School />}
              label={student.school}
              variant="outlined"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
          </Box>

          {/* Logout button */}
          <Button
            color="inherit"
            startIcon={<LogoutOutlined />}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            ออกจากระบบ
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}