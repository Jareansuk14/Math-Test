import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Quiz,
  People,
  Logout,
  AdminPanelSettings,
  Menu as MenuIcon,
  Close,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useExamStore } from '../store/examStore';

const DRAWER_WIDTH = 240;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuthStore();
  const { resetExam } = useExamStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSettled: () => {
      resetExam(); // Reset exam state first
      clearAuth(); // Then clear auth
      navigate('/admin');
    },
  });

  const menuItems = [
    { text: 'จัดการข้อสอบ', icon: <Quiz />, path: '/admin/questions' },
    { text: 'รายชื่อนักเรียน', icon: <People />, path: '/admin/students' },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} color="inherit">
            <Close />
          </IconButton>
        )}
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActivePath(item.path)}
              onClick={() => handleMenuItemClick(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.50',
                    '&:hover': {
                      backgroundColor: 'primary.100',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActivePath(item.path) ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    color: isActivePath(item.path) ? 'primary.main' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <AdminPanelSettings sx={{ mr: 2 }} />
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {isMobile ? 'แอดมิน' : 'ระบบจัดการแอดมิน - แบบฝึกหัดคณิตศาสตร์'}
          </Typography>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            sx={{
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            ออกจากระบบ
          </Button>
          {/* Mobile logout icon */}
          <IconButton
            color="inherit"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            sx={{
              display: { xs: 'flex', sm: 'none' }
            }}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar - Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        // Desktop Drawer
        <Drawer
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {drawer}
      </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 